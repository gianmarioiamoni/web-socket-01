import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types";

// 📦 Type definitions
type SocketState = {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  token: string | null;
  reconnectAttempts: number;
  isReconnecting: boolean;
};

type SocketConfig = {
  url: string;
  maxReconnectAttempts: number;
  reconnectDelay: number;
  timeout: number;
};

type EventHandler<T = any> = (data: T) => void;
type UnsubscribeFn = () => void;

// 🏗️ State management (functional singleton)
let socketState: SocketState = {
  socket: null,
  token: null,
  reconnectAttempts: 0,
  isReconnecting: false,
};

// 🌍 Default configuration
const defaultConfig: SocketConfig = {
  url: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000",
  maxReconnectAttempts: 5,
  reconnectDelay: 1000,
  timeout: 20000,
};

// 🔧 Pure utility functions
const createSocketState = (): SocketState => ({
  socket: null,
  token: null,
  reconnectAttempts: 0,
  isReconnecting: false,
});

const isValidToken = (token: string | null): token is string =>
  typeof token === "string" && token.length > 0;

const shouldReconnect = (attempts: number, maxAttempts: number): boolean =>
  attempts < maxAttempts;

const calculateReconnectDelay = (attempt: number, baseDelay: number): number =>
  Math.min(baseDelay * Math.pow(2, attempt), 30000); // Exponential backoff, max 30s

// 🔌 Core socket functions
export const createSocket = (
  token: string,
  config: Partial<SocketConfig> = {}
): Socket<ServerToClientEvents, ClientToServerEvents> => {
  const finalConfig = { ...defaultConfig, ...config };
  
  return io(finalConfig.url, {
    auth: { token },
    transports: ["websocket", "polling"],
    timeout: finalConfig.timeout,
    forceNew: true,
    autoConnect: true,
  });
};

export const connectSocket = (
  token: string,
  config?: Partial<SocketConfig>
): Socket<ServerToClientEvents, ClientToServerEvents> => {
  if (!isValidToken(token)) {
    throw new Error("Invalid token provided");
  }

  // Disconnect existing socket
  if (socketState.socket?.connected) {
    disconnectSocket();
  }

  const socket = createSocket(token, config);
  
  socketState = {
    ...socketState,
    socket,
    token,
    reconnectAttempts: 0,
    isReconnecting: false,
  };

  setupSocketEventHandlers(socket);
  return socket;
};

export const disconnectSocket = (): void => {
  if (socketState.socket) {
    socketState.socket.disconnect();
  }
  socketState = createSocketState();
};

export const getSocketState = (): Readonly<SocketState> => ({ ...socketState });

export const isSocketConnected = (): boolean =>
  socketState.socket?.connected ?? false;

export const getSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> | null =>
  socketState.socket;

// 🔄 Reconnection logic (pure functions)
const attemptReconnection = async (
  token: string,
  config: Partial<SocketConfig> = {}
): Promise<void> => {
  const finalConfig = { ...defaultConfig, ...config };
  
  if (!shouldReconnect(socketState.reconnectAttempts, finalConfig.maxReconnectAttempts)) {
    console.error("Max reconnection attempts reached");
    return;
  }

  if (socketState.isReconnecting) {
    return; // Avoid multiple simultaneous reconnection attempts
  }

  socketState.isReconnecting = true;
  socketState.reconnectAttempts += 1;

  const delay = calculateReconnectDelay(
    socketState.reconnectAttempts - 1,
    finalConfig.reconnectDelay
  );

  console.log(`Attempting reconnection ${socketState.reconnectAttempts}/${finalConfig.maxReconnectAttempts} in ${delay}ms`);

  await new Promise(resolve => setTimeout(resolve, delay));

  try {
    connectSocket(token, config);
    socketState.reconnectAttempts = 0;
  } catch (error) {
    console.error("Reconnection failed:", error);
  } finally {
    socketState.isReconnecting = false;
  }
};

// 🎧 Event handling functions
export const setupSocketEventHandlers = (
  socket: Socket<ServerToClientEvents, ClientToServerEvents>
): void => {
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    socketState.reconnectAttempts = 0;
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
    
    if (reason === "io server disconnect" && socketState.token) {
      // Server initiated disconnect, attempt reconnection
      attemptReconnection(socketState.token);
    }
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
    
    if (socketState.token) {
      attemptReconnection(socketState.token);
    }
  });
};

// 🚀 Event emission functions
export const emitSocketEvent = <T = any>(
  event: keyof ClientToServerEvents,
  data: T
): void => {
  const socket = getSocket();
  
  if (!socket?.connected) {
    throw new Error("Socket not connected");
  }
  
  socket.emit(event as any, data);
};

// 👂 Event subscription functions
export const subscribeToSocketEvent = <T = any>(
  event: keyof ServerToClientEvents,
  handler: EventHandler<T>
): UnsubscribeFn => {
  const socket = getSocket();
  
  if (!socket) {
    throw new Error("Socket not available");
  }
  
  socket.on(event as any, handler);
  
  return () => {
    socket.off(event as any, handler);
  };
};

// 🎭 Higher-order functions for specific event categories
export const createBoardEventHandlers = () => {
  const joinBoard = (boardId: string): void =>
    emitSocketEvent("board:join", boardId);

  const leaveBoard = (boardId: string): void =>
    emitSocketEvent("board:leave", boardId);

  const onBoardUpdated = (handler: EventHandler): UnsubscribeFn =>
    subscribeToSocketEvent("board:updated", handler);

  const onBoardDeleted = (handler: EventHandler): UnsubscribeFn =>
    subscribeToSocketEvent("board:deleted", handler);

  const onUserJoined = (handler: EventHandler<string>): UnsubscribeFn =>
    subscribeToSocketEvent("user:joined", handler);

  const onUserLeft = (handler: EventHandler<string>): UnsubscribeFn =>
    subscribeToSocketEvent("user:left", handler);

  return {
    joinBoard,
    leaveBoard,
    onBoardUpdated,
    onBoardDeleted,
    onUserJoined,
    onUserLeft,
  };
};

export const createTaskEventHandlers = () => {
  const createTask = (taskData: any): void =>
    emitSocketEvent("task:create", taskData);

  const updateTask = (taskId: string, updates: any): void =>
    emitSocketEvent("task:update", { taskId, updates });

  const deleteTask = (taskId: string): void =>
    emitSocketEvent("task:delete", taskId);

  const moveTask = (taskId: string, columnId: string, position: number): void =>
    emitSocketEvent("task:move", { taskId, columnId, position });

  const onTaskCreated = (handler: EventHandler): UnsubscribeFn =>
    subscribeToSocketEvent("task:created", handler);

  const onTaskUpdated = (handler: EventHandler): UnsubscribeFn =>
    subscribeToSocketEvent("task:updated", handler);

  const onTaskDeleted = (handler: EventHandler): UnsubscribeFn =>
    subscribeToSocketEvent("task:deleted", handler);

  const onTaskMoved = (handler: EventHandler): UnsubscribeFn =>
    subscribeToSocketEvent("task:moved", handler);

  return {
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    onTaskCreated,
    onTaskUpdated,
    onTaskDeleted,
    onTaskMoved,
  };
};

export const createChatEventHandlers = () => {
  const sendMessage = (content: string, type: string = "text"): void =>
    emitSocketEvent("chat:sendMessage", { content, type });

  const startTyping = (): void =>
    emitSocketEvent("chat:typing", {});

  const stopTyping = (): void =>
    emitSocketEvent("chat:stopTyping", {});

  const onMessage = (handler: EventHandler): UnsubscribeFn =>
    subscribeToSocketEvent("chat:message", handler);

  const onUserTyping = (handler: EventHandler<string>): UnsubscribeFn =>
    subscribeToSocketEvent("chat:userTyping", handler);

  const onUserStoppedTyping = (handler: EventHandler<string>): UnsubscribeFn =>
    subscribeToSocketEvent("chat:userStoppedTyping", handler);

  return {
    sendMessage,
    startTyping,
    stopTyping,
    onMessage,
    onUserTyping,
    onUserStoppedTyping,
  };
};

export const createPresenceEventHandlers = () => {
  const updateCursor = (x: number, y: number): void =>
    emitSocketEvent("user:cursor", { x, y });

  const onCursorUpdate = (handler: EventHandler): UnsubscribeFn =>
    subscribeToSocketEvent("user:cursor", handler);

  const onPresenceUpdate = (handler: EventHandler): UnsubscribeFn =>
    subscribeToSocketEvent("presence:update", handler);

  return {
    updateCursor,
    onCursorUpdate,
    onPresenceUpdate,
  };
};

// 🧹 Cleanup functions
export const cleanup = (): void => {
  const socket = getSocket();
  
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }
  
  socketState = createSocketState();
};

// 🎯 Main API object
export const socketAPI = {
  connect: connectSocket,
  disconnect: disconnectSocket,
  isConnected: isSocketConnected,
  getState: getSocketState,
  cleanup,
  board: createBoardEventHandlers(),
  task: createTaskEventHandlers(),
  chat: createChatEventHandlers(),
  presence: createPresenceEventHandlers(),
};
