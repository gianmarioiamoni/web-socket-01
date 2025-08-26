import { Server } from "socket.io";
import { Board } from "../models";
import { logger } from "../middleware/errorHandler";
import { userPresence, boardRooms, getOnlineUsersInBoard } from "./utils";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  AuthenticatedSocket,
} from "../types";

export const boardHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: AuthenticatedSocket
) => {
  // Join board room
  socket.on("board:join", async (boardId: string) => {
    try {
      // Verify user has access to board
      const board = await Board.findById(boardId);
      if (!board) {
        socket.emit("error", { message: "Board not found" });
        return;
      }

      // Check if user is a member
      if (
        !board.members.includes(socket.userId!) &&
        board.ownerId !== socket.userId!
      ) {
        socket.emit("error", { message: "Access denied to this board" });
        return;
      }

      // Leave previous board if any
      const userInfo = userPresence.get(socket.id);
      if (userInfo?.boardId) {
        socket.leave(userInfo.boardId);

        // Remove from previous board's user list
        const prevBoardUsers = boardRooms.get(userInfo.boardId);
        if (prevBoardUsers) {
          prevBoardUsers.delete(socket.id);
          // Notify users in previous board
          socket.to(userInfo.boardId).emit("user:left", socket.userId!);
          // Send updated users list to previous board
          io.to(userInfo.boardId).emit(
            "users:online",
            getOnlineUsersInBoard(userInfo.boardId)
          );
        }
      }

      // Join new board room
      socket.join(boardId);

      // Update user presence
      if (userInfo) {
        userInfo.boardId = boardId;
        userInfo.lastSeen = new Date();
      }

      // Add to board users tracking
      if (!boardRooms.has(boardId)) {
        boardRooms.set(boardId, new Set());
      }
      boardRooms.get(boardId)!.add(socket.id);

      // Get current online users in this board
      const onlineUsers = getOnlineUsersInBoard(boardId);

      // Notify other users in the board about new user
      socket.to(boardId).emit("user:joined", {
        userId: socket.userId!,
        username: socket.username!,
        avatar: socket.userData?.avatar,
        boardId,
      });

      // Send current online users to the joining user
      socket.emit("users:online", onlineUsers);

      // Send updated users list to all users in board
      io.to(boardId).emit("users:online", getOnlineUsersInBoard(boardId));

      logger.info(`User ${socket.username} joined board ${boardId}`);

      // Send success notification
      socket.emit("notification", {
        type: "success",
        message: `Joined board: ${board.title}`,
      });
    } catch (error) {
      logger.error("Error joining board:", error);
      socket.emit("error", { message: "Failed to join board" });
    }
  });

  // Leave board room
  socket.on("board:leave", async (boardId: string) => {
    try {
      socket.leave(boardId);

      // Update user presence
      const userInfo = userPresence.get(socket.id);
      if (userInfo && userInfo.boardId === boardId) {
        userInfo.boardId = undefined;
      }

      // Remove from board users tracking
      const boardUsers = boardRooms.get(boardId);
      if (boardUsers) {
        boardUsers.delete(socket.id);
        if (boardUsers.size === 0) {
          boardRooms.delete(boardId);
        }
      }

      // Notify other users in the board
      socket.to(boardId).emit("user:left", socket.userId!);

      // Send updated users list
      io.to(boardId).emit("users:online", getOnlineUsersInBoard(boardId));

      logger.info(`User ${socket.username} left board ${boardId}`);
    } catch (error) {
      logger.error("Error leaving board:", error);
      socket.emit("error", { message: "Failed to leave board" });
    }
  });

  // Update board
  socket.on("board:update", async (boardId: string, updates) => {
    try {
      // Verify user has permission to update board
      const board = await Board.findById(boardId);
      if (!board) {
        socket.emit("error", { message: "Board not found" });
        return;
      }

      // Check if user is owner or member
      if (
        board.ownerId !== socket.userId! &&
        !board.members.includes(socket.userId!)
      ) {
        socket.emit("error", { message: "Permission denied" });
        return;
      }

      // Only owner can update certain fields
      if (updates.members !== undefined && board.ownerId !== socket.userId!) {
        socket.emit("error", {
          message: "Only board owner can update members",
        });
        return;
      }

      // Update board
      const updatedBoard = await Board.findByIdAndUpdate(
        boardId,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );

      if (!updatedBoard) {
        socket.emit("error", { message: "Failed to update board" });
        return;
      }

      // Notify all users in the board about the update
      io.to(boardId).emit("board:updated", {
        id: (updatedBoard as any)._id.toString(),
        title: (updatedBoard as any).title,
        description: (updatedBoard as any).description,
        ownerId: (updatedBoard as any).ownerId,
        members: (updatedBoard as any).members,
        columns: [], // Will be populated by frontend
        createdAt: (updatedBoard as any).createdAt,
        updatedAt: (updatedBoard as any).updatedAt,
      });

      logger.info(`Board ${boardId} updated by user ${socket.username}`);

      // Send success notification to the user who made the update
      socket.emit("notification", {
        type: "success",
        message: "Board updated successfully",
      });
    } catch (error) {
      logger.error("Error updating board:", error);
      socket.emit("error", { message: "Failed to update board" });
    }
  });
};
