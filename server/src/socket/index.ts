import { Server, Socket } from "socket.io";
import { authenticateSocket } from "../middleware/auth";
import { logger } from "../middleware/errorHandler";
import { userPresence, boardRooms, getOnlineUsersInBoard } from "./utils";
// Import functional implementation
import { setupFunctionalSocketHandlers } from "./functional-handlers";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  AuthenticatedSocket,
} from "../types";

// 🆕 Functional implementation (default and only implementation)
export const setupSocketHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents>
) => {
  // Authentication middleware
  io.use(authenticateSocket);
  
  // Use the functional handlers
  setupFunctionalSocketHandlers(io);
  
  // Handle server-level errors
  io.engine.on("connection_error", (error: Error) => {
    logger.error("Socket.io connection error:", error);
  });

  logger.info("🔧 Functional socket handlers configured successfully");
};

// 🎛️ Main entry point - now uses functional implementation by default
export const initializeSocketServer = (
  io: Server<ClientToServerEvents, ServerToClientEvents>
) => {
  logger.info("🔧 Using functional socket handlers");
  setupSocketHandlers(io);
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
