import { useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/stores/auth";
import { useBoardStore } from "@/stores/board";
import { useTaskStore } from "@/stores/task";
import { useChatStore } from "@/stores/chat";
import { usePresenceStore } from "@/stores/presence";
import { useNotificationStore } from "@/stores/notification";
import {
  connectSocket,
  disconnectSocket,
  isSocketConnected,
  getSocketState,
  createBoardEventHandlers,
  createTaskEventHandlers,
  createChatEventHandlers,
  createPresenceEventHandlers,
} from "@/services/socket-functional";

// 🎯 Main socket hook with functional approach
export const useSocket = () => {
  const { isAuthenticated, token } = useAuthStore();
  const unsubscribeRefs = useRef<Array<() => void>>([]);

  // 🔌 Connection management
  useEffect(() => {
    if (isAuthenticated && token) {
      try {
        connectSocket(token);
      } catch (error) {
        console.error("Failed to connect socket:", error);
      }
    } else {
      disconnectSocket();
    }

    return () => {
      // Cleanup all subscriptions
      unsubscribeRefs.current.forEach((unsub) => unsub());
      unsubscribeRefs.current = [];
      disconnectSocket();
    };
  }, [isAuthenticated, token]);

  // Helper to manage subscriptions
  const addSubscription = useCallback((unsubscribe: () => void) => {
    unsubscribeRefs.current.push(unsubscribe);
  }, []);

  return {
    isConnected: isSocketConnected(),
    state: getSocketState(),
    addSubscription,
  };
};

// 🏠 Board-specific socket hook
export const useBoardSocket = () => {
  const { addSubscription } = useSocket();
  const { updateBoard } = useBoardStore();
  const { addNotification } = useNotificationStore();

  const boardHandlers = createBoardEventHandlers();

  // 🎧 Auto-subscribe to board events
  useEffect(() => {
    if (!isSocketConnected()) return;

    const subscriptions = [
      boardHandlers.onBoardUpdated((board) => {
        updateBoard(board);
        addNotification({
          type: "info",
          title: "Board Updated",
          description: `Board "${board.title}" has been updated`,
        });
      }),

      boardHandlers.onBoardDeleted((boardId) => {
        // TODO: Implement removeBoard in store
        console.log("Board deleted:", boardId);
        addNotification({
          type: "warning",
          title: "Board Deleted",
          description: "The board has been deleted",
        });
      }),

      boardHandlers.onUserJoined((userId) => {
        // TODO: Implement addOnlineUser in store
        console.log("User joined:", userId);
        addNotification({
          type: "info",
          title: "User Joined",
          description: "A user has joined the board",
        });
      }),

      boardHandlers.onUserLeft((userId) => {
        // TODO: Implement removeOnlineUser in store
        console.log("User left:", userId);
      }),
    ];

    subscriptions.forEach(addSubscription);

    return () => {
      subscriptions.forEach((unsub) => unsub());
    };
  }, [boardHandlers, updateBoard, addNotification, addSubscription]);

  // 🎯 Memoized action functions
  const joinBoard = useCallback(
    (boardId: string) => {
      try {
        boardHandlers.joinBoard(boardId);
      } catch (error) {
        console.error("Failed to join board:", error);
      }
    },
    [boardHandlers]
  );

  const leaveBoard = useCallback(
    (boardId: string) => {
      try {
        boardHandlers.leaveBoard(boardId);
      } catch (error) {
        console.error("Failed to leave board:", error);
      }
    },
    [boardHandlers]
  );

  return {
    joinBoard,
    leaveBoard,
  };
};

// 📋 Task-specific socket hook
export const useTaskSocket = () => {
  const { addSubscription } = useSocket();
  const { addTask, updateTask } = useTaskStore();
  const { addNotification } = useNotificationStore();

  const taskHandlers = createTaskEventHandlers();

  // 🎧 Auto-subscribe to task events
  useEffect(() => {
    if (!isSocketConnected()) return;

    const subscriptions = [
      taskHandlers.onTaskCreated((task) => {
        addTask(task);
        addNotification({
          type: "success",
          title: "Task Created",
          description: `New task "${task.title}" has been created`,
        });
      }),

      taskHandlers.onTaskUpdated((task) => {
        updateTask(task);
        addNotification({
          type: "info",
          title: "Task Updated",
          description: `Task "${task.title}" has been updated`,
        });
      }),

      taskHandlers.onTaskDeleted((taskId) => {
        // TODO: Implement removeTask in store
        console.log("Task deleted:", taskId);
        addNotification({
          type: "warning",
          title: "Task Deleted",
          description: "A task has been deleted",
        });
      }),

      taskHandlers.onTaskMoved(({ taskId, columnId, position }) => {
        // TODO: Implement moveTaskInStore in store
        console.log("Task moved:", { taskId, columnId, position });
      }),
    ];

    subscriptions.forEach(addSubscription);

    return () => {
      subscriptions.forEach((unsub) => unsub());
    };
  }, [taskHandlers, addTask, updateTask, addNotification, addSubscription]);

  // 🎯 Memoized action functions
  const createTask = useCallback(
    (taskData: Record<string, unknown>) => {
      try {
        taskHandlers.createTask(taskData);
      } catch (error) {
        console.error("Failed to create task:", error);
      }
    },
    [taskHandlers]
  );

  const updateTaskAction = useCallback(
    (taskId: string, updates: Record<string, unknown>) => {
      try {
        taskHandlers.updateTask(taskId, updates);
      } catch (error) {
        console.error("Failed to update task:", error);
      }
    },
    [taskHandlers]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      try {
        taskHandlers.deleteTask(taskId);
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    },
    [taskHandlers]
  );

  const moveTask = useCallback(
    (taskId: string, columnId: string, position: number) => {
      try {
        taskHandlers.moveTask(taskId, columnId, position);
      } catch (error) {
        console.error("Failed to move task:", error);
      }
    },
    [taskHandlers]
  );

  return {
    createTask,
    updateTask: updateTaskAction,
    deleteTask,
    moveTask,
  };
};

// 💬 Chat-specific socket hook
export const useChatSocket = () => {
  const { addSubscription } = useSocket();
  const { addMessage } = useChatStore();

  const chatHandlers = createChatEventHandlers();

  // 🎧 Auto-subscribe to chat events
  useEffect(() => {
    if (!isSocketConnected()) return;

    const subscriptions = [
      chatHandlers.onMessage((message) => {
        addMessage(message);
      }),

      chatHandlers.onUserTyping((username) => {
        // TODO: Implement setUserTyping in store
        console.log("User typing:", username);
      }),

      chatHandlers.onUserStoppedTyping((username) => {
        // TODO: Implement setUserStoppedTyping in store
        console.log("User stopped typing:", username);
      }),
    ];

    subscriptions.forEach(addSubscription);

    return () => {
      subscriptions.forEach((unsub) => unsub());
    };
  }, [chatHandlers, addMessage, addSubscription]);

  // 🎯 Memoized action functions
  const sendMessage = useCallback(
    (content: string, type: string = "text") => {
      try {
        chatHandlers.sendMessage(content, type);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [chatHandlers]
  );

  const startTyping = useCallback(() => {
    try {
      chatHandlers.startTyping();
    } catch (error) {
      console.error("Failed to start typing:", error);
    }
  }, [chatHandlers]);

  const stopTyping = useCallback(() => {
    try {
      chatHandlers.stopTyping();
    } catch (error) {
      console.error("Failed to stop typing:", error);
    }
  }, [chatHandlers]);

  return {
    sendMessage,
    startTyping,
    stopTyping,
  };
};

// 👥 Presence-specific socket hook
export const usePresenceSocket = () => {
  const { addSubscription } = useSocket();
  const { updateUserCursor } = usePresenceStore();

  const presenceHandlers = createPresenceEventHandlers();

  // 🎧 Auto-subscribe to presence events
  useEffect(() => {
    if (!isSocketConnected()) return;

    const subscriptions = [
      presenceHandlers.onCursorUpdate(({ userId, x, y }) => {
        updateUserCursor({
          userId,
          x,
          y,
          socketId: "",
          username: "",
          lastSeen: new Date(),
        });
      }),

      presenceHandlers.onPresenceUpdate((presenceData) => {
        // TODO: Implement updatePresence in store
        console.log("Presence updated:", presenceData);
      }),
    ];

    subscriptions.forEach(addSubscription);

    return () => {
      subscriptions.forEach((unsub) => unsub());
    };
  }, [presenceHandlers, updateUserCursor, addSubscription]);

  // 🎯 Memoized action functions
  const updateCursor = useCallback(
    (x: number, y: number) => {
      try {
        presenceHandlers.updateCursor(x, y);
      } catch (error) {
        console.error("Failed to update cursor:", error);
      }
    },
    [presenceHandlers]
  );

  return {
    updateCursor,
  };
};

// 🎭 Composed hook for complete socket functionality
export const useSocketIntegration = () => {
  const socket = useSocket();
  const board = useBoardSocket();
  const task = useTaskSocket();
  const chat = useChatSocket();
  const presence = usePresenceSocket();

  return {
    socket,
    board,
    task,
    chat,
    presence,
  };
};
