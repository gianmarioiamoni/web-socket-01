import { Server } from "socket.io";
import { Board, Task, Column, ChatMessage, User } from "../models";
import { logger } from "../middleware/errorHandler";
import { userPresence, boardRooms, getOnlineUsersInBoard } from "./utils";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  AuthenticatedSocket,
} from "../types";
import type { Board as BoardType, Task as TaskType, ChatMessage as ChatMessageType } from "../../../shared/types";

// 🎯 Pure functions for business logic
const validateBoardAccess = (board: any, userId: string): boolean =>
  board && (board.members.includes(userId) || board.ownerId === userId);

const validateColumnAccess = async (columnId: string, userId: string): Promise<boolean> => {
  try {
    const column = await Column.findById(columnId).populate("boardId");
    if (!column || !column.boardId) return false;
    
    return validateBoardAccess(column.boardId, userId);
  } catch {
    return false;
  }
};

const createTaskResponse = (task: any): TaskType => ({
  id: task._id.toString(),
  title: task.title,
  description: task.description,
  columnId: task.columnId,
  assigneeId: task.assigneeId,
  position: task.position,
  priority: task.priority,
  dueDate: task.dueDate,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
  createdBy: task.createdBy,
});

const createBoardResponse = (board: any): BoardType => ({
  id: board._id.toString(),
  title: board.title,
  description: board.description,
  ownerId: board.ownerId,
  members: board.members,
  isPublic: board.isPublic,
  createdAt: board.createdAt,
  updatedAt: board.updatedAt,
});

const createChatMessageResponse = (message: any): ChatMessageType => ({
  id: message._id.toString(),
  boardId: message.boardId,
  userId: message.userId,
  username: message.username,
  content: message.content,
  timestamp: message.timestamp,
  type: message.type,
});

// 🔧 Utility functions for socket operations
const getUserBoardId = (socketId: string): string | null => {
  const userInfo = userPresence.get(socketId);
  return userInfo?.boardId || null;
};

const emitToBoard = (
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  boardId: string,
  event: keyof ServerToClientEvents,
  data: any
): void => {
  io.to(boardId).emit(event as any, data);
};

const emitToUser = (
  socket: AuthenticatedSocket,
  event: keyof ServerToClientEvents,
  data: any
): void => {
  socket.emit(event as any, data);
};

const emitError = (socket: AuthenticatedSocket, message: string): void => {
  socket.emit("error", { message });
};

// 🎭 Higher-order functions for error handling
const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorMessage: string = "Operation failed"
) => 
  async (...args: T): Promise<R | void> => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error(`${errorMessage}:`, error);
      throw error;
    }
  };

const withSocketErrorHandling = <T extends any[]>(
  fn: (socket: AuthenticatedSocket, ...args: T) => Promise<void>,
  errorMessage: string = "Operation failed"
) =>
  async (socket: AuthenticatedSocket, ...args: T): Promise<void> => {
    try {
      await fn(socket, ...args);
    } catch (error) {
      logger.error(`${errorMessage}:`, error);
      emitError(socket, errorMessage);
    }
  };

// 🏠 Board handler functions
const handleBoardJoin = withSocketErrorHandling(
  async (socket: AuthenticatedSocket, boardId: string) => {
    const board = await Board.findById(boardId);
    
    if (!validateBoardAccess(board, socket.userId!)) {
      emitError(socket, "Access denied to this board");
      return;
    }

    // Leave previous board if any
    const userInfo = userPresence.get(socket.id);
    if (userInfo?.boardId && userInfo.boardId !== boardId) {
      socket.leave(userInfo.boardId);
      
      const prevBoardUsers = boardRooms.get(userInfo.boardId);
      if (prevBoardUsers) {
        prevBoardUsers.delete(socket.id);
        socket.to(userInfo.boardId).emit("user:left", socket.userId!);
      }
    }

    // Join new board
    socket.join(boardId);
    
    // Update user presence
    userPresence.set(socket.id, {
      ...userInfo!,
      boardId,
    });

    // Add to board room
    if (!boardRooms.has(boardId)) {
      boardRooms.set(boardId, new Set());
    }
    boardRooms.get(boardId)!.add(socket.id);

    // Notify other users
    socket.to(boardId).emit("user:joined", socket.userId!);

    // Send current online users
    const onlineUsers = getOnlineUsersInBoard(boardId);
    socket.emit("presence:update", onlineUsers);

    logger.info(`User ${socket.username} joined board ${boardId}`);
  },
  "Failed to join board"
);

const handleBoardLeave = withSocketErrorHandling(
  async (socket: AuthenticatedSocket, boardId: string) => {
    socket.leave(boardId);
    
    const userInfo = userPresence.get(socket.id);
    if (userInfo) {
      userPresence.set(socket.id, {
        ...userInfo,
        boardId: null,
      });
    }

    const boardUsers = boardRooms.get(boardId);
    if (boardUsers) {
      boardUsers.delete(socket.id);
      if (boardUsers.size === 0) {
        boardRooms.delete(boardId);
      }
    }

    socket.to(boardId).emit("user:left", socket.userId!);
    logger.info(`User ${socket.username} left board ${boardId}`);
  },
  "Failed to leave board"
);

// 📋 Task handler functions
const handleTaskCreate = (io: Server<ClientToServerEvents, ServerToClientEvents>) =>
  withSocketErrorHandling(
    async (socket: AuthenticatedSocket, taskData: any) => {
      const boardId = getUserBoardId(socket.id);
      if (!boardId) {
        emitError(socket, "Not connected to any board");
        return;
      }

      // Validate column access
      const hasAccess = await validateColumnAccess(taskData.columnId, socket.userId!);
      if (!hasAccess) {
        emitError(socket, "Access denied");
        return;
      }

      const newTask = await Task.create({
        ...taskData,
        createdBy: socket.userId!,
      });

      const taskResponse = createTaskResponse(newTask);
      emitToBoard(io, boardId, "task:created", taskResponse);

      logger.info(`Task created by ${socket.username} in board ${boardId}`);
    },
    "Failed to create task"
  );

const handleTaskUpdate = (io: Server<ClientToServerEvents, ServerToClientEvents>) =>
  withSocketErrorHandling(
    async (socket: AuthenticatedSocket, { taskId, updates }: { taskId: string; updates: any }) => {
      const boardId = getUserBoardId(socket.id);
      if (!boardId) {
        emitError(socket, "Not connected to any board");
        return;
      }

      const task = await Task.findById(taskId);
      if (!task) {
        emitError(socket, "Task not found");
        return;
      }

      // Validate access through column
      const hasAccess = await validateColumnAccess(task.columnId, socket.userId!);
      if (!hasAccess) {
        emitError(socket, "Access denied");
        return;
      }

      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );

      if (updatedTask) {
        const taskResponse = createTaskResponse(updatedTask);
        emitToBoard(io, boardId, "task:updated", taskResponse);

        logger.info(`Task ${taskId} updated by ${socket.username}`);
      }
    },
    "Failed to update task"
  );

const handleTaskDelete = (io: Server<ClientToServerEvents, ServerToClientEvents>) =>
  withSocketErrorHandling(
    async (socket: AuthenticatedSocket, taskId: string) => {
      const boardId = getUserBoardId(socket.id);
      if (!boardId) {
        emitError(socket, "Not connected to any board");
        return;
      }

      const task = await Task.findById(taskId);
      if (!task) {
        emitError(socket, "Task not found");
        return;
      }

      const hasAccess = await validateColumnAccess(task.columnId, socket.userId!);
      if (!hasAccess) {
        emitError(socket, "Access denied");
        return;
      }

      await Task.findByIdAndDelete(taskId);
      emitToBoard(io, boardId, "task:deleted", taskId);

      logger.info(`Task ${taskId} deleted by ${socket.username}`);
    },
    "Failed to delete task"
  );

const handleTaskMove = (io: Server<ClientToServerEvents, ServerToClientEvents>) =>
  withSocketErrorHandling(
    async (socket: AuthenticatedSocket, { taskId, columnId, position }: any) => {
      const boardId = getUserBoardId(socket.id);
      if (!boardId) {
        emitError(socket, "Not connected to any board");
        return;
      }

      // Validate access to both source and destination columns
      const task = await Task.findById(taskId);
      if (!task) {
        emitError(socket, "Task not found");
        return;
      }

      const [sourceAccess, destAccess] = await Promise.all([
        validateColumnAccess(task.columnId, socket.userId!),
        validateColumnAccess(columnId, socket.userId!),
      ]);

      if (!sourceAccess || !destAccess) {
        emitError(socket, "Access denied");
        return;
      }

      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { columnId, position, updatedAt: new Date() },
        { new: true }
      );

      if (updatedTask) {
        emitToBoard(io, boardId, "task:moved", {
          taskId,
          columnId,
          position,
          task: createTaskResponse(updatedTask),
        });

        logger.info(`Task ${taskId} moved by ${socket.username}`);
      }
    },
    "Failed to move task"
  );

// 💬 Chat handler functions
const handleChatSendMessage = (io: Server<ClientToServerEvents, ServerToClientEvents>) =>
  withSocketErrorHandling(
    async (socket: AuthenticatedSocket, messageData: { content: string; type?: string }) => {
      const boardId = getUserBoardId(socket.id);
      if (!boardId) {
        emitError(socket, "Not connected to any board");
        return;
      }

      const chatMessage = await ChatMessage.create({
        boardId,
        userId: socket.userId!,
        username: socket.username!,
        content: messageData.content,
        type: messageData.type || "text",
        timestamp: new Date(),
      });

      const messageResponse = createChatMessageResponse(chatMessage);
      emitToBoard(io, boardId, "chat:message", messageResponse);

      logger.info(`Chat message sent by ${socket.username} in board ${boardId}`);
    },
    "Failed to send message"
  );

const handleChatTyping = (io: Server<ClientToServerEvents, ServerToClientEvents>) =>
  (socket: AuthenticatedSocket) => {
    const boardId = getUserBoardId(socket.id);
    if (boardId) {
      socket.to(boardId).emit("chat:userTyping", socket.username!);
    }
  };

const handleChatStopTyping = (io: Server<ClientToServerEvents, ServerToClientEvents>) =>
  (socket: AuthenticatedSocket) => {
    const boardId = getUserBoardId(socket.id);
    if (boardId) {
      socket.to(boardId).emit("chat:userStoppedTyping", socket.username!);
    }
  };

// 👥 Presence handler functions
const handleUserCursor = (io: Server<ClientToServerEvents, ServerToClientEvents>) =>
  (socket: AuthenticatedSocket, { x, y }: { x: number; y: number }) => {
    const boardId = getUserBoardId(socket.id);
    if (boardId) {
      socket.to(boardId).emit("user:cursor", {
        userId: socket.userId!,
        username: socket.username!,
        x,
        y,
      });
    }
  };

// 🎭 Factory functions for creating handlers
export const createBoardHandlers = (io: Server<ClientToServerEvents, ServerToClientEvents>) => ({
  join: handleBoardJoin,
  leave: handleBoardLeave,
});

export const createTaskHandlers = (io: Server<ClientToServerEvents, ServerToClientEvents>) => ({
  create: handleTaskCreate(io),
  update: handleTaskUpdate(io),
  delete: handleTaskDelete(io),
  move: handleTaskMove(io),
});

export const createChatHandlers = (io: Server<ClientToServerEvents, ServerToClientEvents>) => ({
  sendMessage: handleChatSendMessage(io),
  typing: handleChatTyping(io),
  stopTyping: handleChatStopTyping(io),
});

export const createPresenceHandlers = (io: Server<ClientToServerEvents, ServerToClientEvents>) => ({
  cursor: handleUserCursor(io),
});

// 🔗 Handler registration function
export const registerSocketHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: AuthenticatedSocket
): (() => void) => {
  const boardHandlers = createBoardHandlers(io);
  const taskHandlers = createTaskHandlers(io);
  const chatHandlers = createChatHandlers(io);
  const presenceHandlers = createPresenceHandlers(io);

  // Register board events
  socket.on("board:join", boardHandlers.join);
  socket.on("board:leave", boardHandlers.leave);

  // Register task events
  socket.on("task:create", taskHandlers.create);
  socket.on("task:update", taskHandlers.update);
  socket.on("task:delete", taskHandlers.delete);
  socket.on("task:move", taskHandlers.move);

  // Register chat events
  socket.on("chat:sendMessage", chatHandlers.sendMessage);
  socket.on("chat:typing", chatHandlers.typing);
  socket.on("chat:stopTyping", chatHandlers.stopTyping);

  // Register presence events
  socket.on("user:cursor", presenceHandlers.cursor);

  // Return cleanup function
  return () => {
    socket.removeAllListeners("board:join");
    socket.removeAllListeners("board:leave");
    socket.removeAllListeners("task:create");
    socket.removeAllListeners("task:update");
    socket.removeAllListeners("task:delete");
    socket.removeAllListeners("task:move");
    socket.removeAllListeners("chat:sendMessage");
    socket.removeAllListeners("chat:typing");
    socket.removeAllListeners("chat:stopTyping");
    socket.removeAllListeners("user:cursor");
  };
};

// 🎯 Main setup function with functional composition
export const setupFunctionalSocketHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents>
) => {
  io.on("connection", (socket: AuthenticatedSocket) => {
    logger.info(`User connected: ${socket.username} (${socket.userId})`);

    // Store user presence
    userPresence.set(socket.id, {
      socketId: socket.id,
      userId: socket.userId!,
      username: socket.username!,
      ...(socket.userData!.avatar && { avatar: socket.userData!.avatar }),
      boardId: null,
      lastSeen: new Date(),
    });

    // Register all handlers and get cleanup function
    const cleanup = registerSocketHandlers(io, socket);

    // Handle disconnection
    socket.on("disconnect", (reason: string) => {
      logger.info(`User disconnected: ${socket.username} (${reason})`);

      const userInfo = userPresence.get(socket.id);
      if (userInfo?.boardId) {
        socket.to(userInfo.boardId).emit("user:left", socket.userId!);
        
        const boardUsers = boardRooms.get(userInfo.boardId);
        if (boardUsers) {
          boardUsers.delete(socket.id);
          if (boardUsers.size === 0) {
            boardRooms.delete(userInfo.boardId);
          }
        }
      }

      userPresence.delete(socket.id);
      cleanup();
    });

    socket.on("error", (error: Error) => {
      logger.error(`Socket error for user ${socket.username}:`, error);
    });
  });
};
