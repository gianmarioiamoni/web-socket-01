"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boardHandlers = void 0;
const models_1 = require("@/models");
const errorHandler_1 = require("@/middleware/errorHandler");
const utils_1 = require("./utils");
const boardHandlers = (io, socket) => {
    socket.on("board:join", async (boardId) => {
        try {
            const board = await models_1.Board.findById(boardId);
            if (!board) {
                socket.emit("error", { message: "Board not found" });
                return;
            }
            if (!board.members.includes(socket.userId) &&
                board.ownerId !== socket.userId) {
                socket.emit("error", { message: "Access denied to this board" });
                return;
            }
            const userInfo = utils_1.userPresence.get(socket.id);
            if (userInfo?.boardId) {
                socket.leave(userInfo.boardId);
                const prevBoardUsers = utils_1.boardRooms.get(userInfo.boardId);
                if (prevBoardUsers) {
                    prevBoardUsers.delete(socket.id);
                    socket.to(userInfo.boardId).emit("user:left", socket.userId);
                    io.to(userInfo.boardId).emit("users:online", (0, utils_1.getOnlineUsersInBoard)(userInfo.boardId));
                }
            }
            socket.join(boardId);
            if (userInfo) {
                userInfo.boardId = boardId;
                userInfo.lastSeen = new Date();
            }
            if (!utils_1.boardRooms.has(boardId)) {
                utils_1.boardRooms.set(boardId, new Set());
            }
            utils_1.boardRooms.get(boardId).add(socket.id);
            const onlineUsers = (0, utils_1.getOnlineUsersInBoard)(boardId);
            socket.to(boardId).emit("user:joined", {
                userId: socket.userId,
                username: socket.username,
                avatar: socket.userData?.avatar,
                boardId,
            });
            socket.emit("users:online", onlineUsers);
            io.to(boardId).emit("users:online", (0, utils_1.getOnlineUsersInBoard)(boardId));
            errorHandler_1.logger.info(`User ${socket.username} joined board ${boardId}`);
            socket.emit("notification", {
                type: "success",
                message: `Joined board: ${board.title}`,
            });
        }
        catch (error) {
            errorHandler_1.logger.error("Error joining board:", error);
            socket.emit("error", { message: "Failed to join board" });
        }
    });
    socket.on("board:leave", async (boardId) => {
        try {
            socket.leave(boardId);
            const userInfo = utils_1.userPresence.get(socket.id);
            if (userInfo && userInfo.boardId === boardId) {
                userInfo.boardId = undefined;
            }
            const boardUsers = utils_1.boardRooms.get(boardId);
            if (boardUsers) {
                boardUsers.delete(socket.id);
                if (boardUsers.size === 0) {
                    utils_1.boardRooms.delete(boardId);
                }
            }
            socket.to(boardId).emit("user:left", socket.userId);
            io.to(boardId).emit("users:online", (0, utils_1.getOnlineUsersInBoard)(boardId));
            errorHandler_1.logger.info(`User ${socket.username} left board ${boardId}`);
        }
        catch (error) {
            errorHandler_1.logger.error("Error leaving board:", error);
            socket.emit("error", { message: "Failed to leave board" });
        }
    });
    socket.on("board:update", async (boardId, updates) => {
        try {
            const board = await models_1.Board.findById(boardId);
            if (!board) {
                socket.emit("error", { message: "Board not found" });
                return;
            }
            if (board.ownerId !== socket.userId &&
                !board.members.includes(socket.userId)) {
                socket.emit("error", { message: "Permission denied" });
                return;
            }
            if (updates.members !== undefined && board.ownerId !== socket.userId) {
                socket.emit("error", {
                    message: "Only board owner can update members",
                });
                return;
            }
            const updatedBoard = await models_1.Board.findByIdAndUpdate(boardId, { ...updates, updatedAt: new Date() }, { new: true });
            if (!updatedBoard) {
                socket.emit("error", { message: "Failed to update board" });
                return;
            }
            io.to(boardId).emit("board:updated", {
                id: updatedBoard._id.toString(),
                title: updatedBoard.title,
                description: updatedBoard.description,
                ownerId: updatedBoard.ownerId,
                members: updatedBoard.members,
                columns: [],
                createdAt: updatedBoard.createdAt,
                updatedAt: updatedBoard.updatedAt,
            });
            errorHandler_1.logger.info(`Board ${boardId} updated by user ${socket.username}`);
            socket.emit("notification", {
                type: "success",
                message: "Board updated successfully",
            });
        }
        catch (error) {
            errorHandler_1.logger.error("Error updating board:", error);
            socket.emit("error", { message: "Failed to update board" });
        }
    });
};
exports.boardHandlers = boardHandlers;
//# sourceMappingURL=boardHandlers.js.map