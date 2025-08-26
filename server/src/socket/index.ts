import { Server, Socket } from "socket.io";
import { authenticateSocket } from "@/middleware/auth";
import { logger } from "@/middleware/errorHandler";
import { userPresence, boardRooms, getOnlineUsersInBoard } from "./utils";
import {
  boardHandlers,
  taskHandlers,
  chatHandlers,
  userHandlers,
} from "./handlers";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  AuthenticatedSocket,
} from "@/types";

export const setupSocketHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents>
) => {
  // Authentication middleware
  io.use(authenticateSocket);

  io.on("connection", (socket: AuthenticatedSocket) => {
    logger.info(`User connected: ${socket.username} (${socket.userId})`);

    // Store user presence
    userPresence.set(socket.id, {
      socketId: socket.id,
      userId: socket.userId!,
      username: socket.username!,
      avatar: socket.userData?.avatar || undefined,
      lastSeen: new Date(),
    });

    // Setup event handlers
    boardHandlers(io, socket);
    taskHandlers(io, socket);
    chatHandlers(io, socket);
    userHandlers(io, socket);

    // Handle disconnection
    socket.on("disconnect", (reason: string) => {
      logger.info(`User disconnected: ${socket.username} (${reason})`);

      const userInfo = userPresence.get(socket.id);
      if (userInfo && userInfo.boardId) {
        // Remove user from board room
        const boardUsers = boardRooms.get(userInfo.boardId);
        if (boardUsers) {
          boardUsers.delete(socket.id);
          if (boardUsers.size === 0) {
            boardRooms.delete(userInfo.boardId);
          }
        }

        // Notify other users in the board
        socket.to(userInfo.boardId).emit("user:left", userInfo.userId);

        // Send updated online users list
        const onlineUsers = getOnlineUsersInBoard(userInfo.boardId);
        io.to(userInfo.boardId).emit("users:online", onlineUsers);
      }

      // Remove from presence tracking
      userPresence.delete(socket.id);
    });

    // Handle connection errors
    socket.on("error", (error: Error) => {
      logger.error(`Socket error for user ${socket.username}:`, error);
    });

    // Send initial connection confirmation
    socket.emit("notification", {
      type: "success",
      message: "Connected to real-time server",
    });
  });

  // Handle server-level errors
  io.engine.on("connection_error", (error: Error) => {
    logger.error("Socket.io connection error:", error);
  });

  logger.info("Socket.io handlers configured successfully");
};

export const notifyBoardMembers = (
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  boardId: string,
  event: keyof ServerToClientEvents,
  data: any,
  excludeSocketId?: string
) => {
  if (excludeSocketId) {
    io.to(boardId)
      .except(excludeSocketId)
      .emit(event as any, data);
  } else {
    io.to(boardId).emit(event as any, data);
  }
};

// Re-export utilities for backward compatibility
export {
  getSocketsByUserId,
  getOnlineUsersInBoard,
  userPresence,
  boardRooms,
} from "./utils";
