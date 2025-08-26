import { Server } from "socket.io";
import { logger } from "@/middleware/errorHandler";
import { userPresence } from "./utils";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  AuthenticatedSocket,
} from "@/types";

export const userHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: AuthenticatedSocket
) => {
  // Handle cursor movement
  socket.on("user:cursor", (cursor) => {
    try {
      const userInfo = userPresence.get(socket.id);
      if (!userInfo?.boardId) {
        return;
      }

      // Update cursor position in presence
      userInfo.lastSeen = new Date();

      // Broadcast cursor position to other users in the board
      socket.to(userInfo.boardId).emit("user:cursor", {
        userId: socket.userId!,
        username: socket.username!,
        avatar: socket.userData?.avatar,
        boardId: userInfo.boardId,
        cursor,
      });
    } catch (error) {
      logger.error("Error handling cursor movement:", error);
    }
  });

  // Handle heartbeat/keep-alive
  socket.on("ping", () => {
    try {
      const userInfo = userPresence.get(socket.id);
      if (userInfo) {
        userInfo.lastSeen = new Date();
      }

      socket.emit("pong");
    } catch (error) {
      logger.error("Error handling ping:", error);
    }
  });
};
