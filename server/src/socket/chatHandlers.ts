import { Server } from "socket.io";
import { ChatMessage } from "../models";
import { logger } from "../middleware/errorHandler";
import { userPresence } from "./utils";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  AuthenticatedSocket,
  ChatMessage as ChatMessageType,
} from "../types";

// Track typing users per board
const typingUsers = new Map<string, Map<string, NodeJS.Timeout>>();

export const chatHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: AuthenticatedSocket
) => {
  // Send chat message
  socket.on("chat:send", async (messageData) => {
    try {
      // Verify user is in a board
      const userInfo = userPresence.get(socket.id);
      if (!userInfo?.boardId) {
        socket.emit("error", { message: "Not connected to any board" });
        return;
      }

      // Create chat message
      const chatMessage = await ChatMessage.create({
        boardId: userInfo.boardId,
        userId: socket.userId!,
        username: socket.username!,
        content: messageData.content,
        type: messageData.type || "text",
        timestamp: new Date(),
      });

      const messageResponse: ChatMessageType = {
        id: (chatMessage as any)._id.toString(),
        boardId: (chatMessage as any).boardId,
        userId: (chatMessage as any).userId,
        username: (chatMessage as any).username,
        content: (chatMessage as any).content,
        timestamp: (chatMessage as any).timestamp,
        type: (chatMessage as any).type,
      };

      // Send to all users in the board
      io.to(userInfo.boardId).emit("chat:message", messageResponse);

      logger.info(
        `Chat message sent by ${socket.username} in board ${userInfo.boardId}`
      );
    } catch (error) {
      logger.error("Error sending chat message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle typing indicator
  socket.on("chat:typing", () => {
    try {
      const userInfo = userPresence.get(socket.id);
      if (!userInfo?.boardId) {
        return;
      }

      // Clear existing typing timeout for this user
      const boardTyping = typingUsers.get(userInfo.boardId);
      if (boardTyping) {
        const existingTimeout = boardTyping.get(socket.userId!);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }
      } else {
        typingUsers.set(userInfo.boardId, new Map());
      }

      // Notify other users that this user is typing
      socket.to(userInfo.boardId).emit("chat:typing", {
        userId: socket.userId!,
        username: socket.username!,
        boardId: userInfo.boardId,
      });

      // Set timeout to automatically stop typing after 3 seconds
      const timeout = setTimeout(() => {
        socket.to(userInfo.boardId!).emit("chat:stop-typing", socket.userId!);

        const boardTyping = typingUsers.get(userInfo.boardId!);
        if (boardTyping) {
          boardTyping.delete(socket.userId!);
          if (boardTyping.size === 0) {
            typingUsers.delete(userInfo.boardId!);
          }
        }
      }, 3000);

      typingUsers.get(userInfo.boardId)!.set(socket.userId!, timeout);
    } catch (error) {
      logger.error("Error handling typing indicator:", error);
    }
  });

  // Handle stop typing
  socket.on("chat:stop-typing", () => {
    try {
      const userInfo = userPresence.get(socket.id);
      if (!userInfo?.boardId) {
        return;
      }

      // Clear typing timeout
      const boardTyping = typingUsers.get(userInfo.boardId);
      if (boardTyping) {
        const existingTimeout = boardTyping.get(socket.userId!);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          boardTyping.delete(socket.userId!);

          if (boardTyping.size === 0) {
            typingUsers.delete(userInfo.boardId);
          }
        }
      }

      // Notify other users that this user stopped typing
      socket.to(userInfo.boardId).emit("chat:stop-typing", socket.userId!);
    } catch (error) {
      logger.error("Error handling stop typing:", error);
    }
  });

  // Clean up typing indicators when user disconnects
  socket.on("disconnect", () => {
    const userInfo = userPresence.get(socket.id);
    if (userInfo?.boardId) {
      // Clear any typing timeouts for this user
      const boardTyping = typingUsers.get(userInfo.boardId);
      if (boardTyping) {
        const existingTimeout = boardTyping.get(socket.userId!);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          boardTyping.delete(socket.userId!);

          if (boardTyping.size === 0) {
            typingUsers.delete(userInfo.boardId);
          }
        }
      }

      // Notify that user stopped typing
      socket.to(userInfo.boardId).emit("chat:stop-typing", socket.userId!);
    }
  });
};
