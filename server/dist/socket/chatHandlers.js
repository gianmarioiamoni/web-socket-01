"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatHandlers = void 0;
const models_1 = require("@/models");
const errorHandler_1 = require("@/middleware/errorHandler");
const utils_1 = require("./utils");
const typingUsers = new Map();
const chatHandlers = (io, socket) => {
    socket.on("chat:send", async (messageData) => {
        try {
            const userInfo = utils_1.userPresence.get(socket.id);
            if (!userInfo?.boardId) {
                socket.emit("error", { message: "Not connected to any board" });
                return;
            }
            const chatMessage = await models_1.ChatMessage.create({
                boardId: userInfo.boardId,
                userId: socket.userId,
                username: socket.username,
                content: messageData.content,
                type: messageData.type || "text",
                timestamp: new Date(),
            });
            const messageResponse = {
                id: chatMessage._id.toString(),
                boardId: chatMessage.boardId,
                userId: chatMessage.userId,
                username: chatMessage.username,
                content: chatMessage.content,
                timestamp: chatMessage.timestamp,
                type: chatMessage.type,
            };
            io.to(userInfo.boardId).emit("chat:message", messageResponse);
            errorHandler_1.logger.info(`Chat message sent by ${socket.username} in board ${userInfo.boardId}`);
        }
        catch (error) {
            errorHandler_1.logger.error("Error sending chat message:", error);
            socket.emit("error", { message: "Failed to send message" });
        }
    });
    socket.on("chat:typing", () => {
        try {
            const userInfo = utils_1.userPresence.get(socket.id);
            if (!userInfo?.boardId) {
                return;
            }
            const boardTyping = typingUsers.get(userInfo.boardId);
            if (boardTyping) {
                const existingTimeout = boardTyping.get(socket.userId);
                if (existingTimeout) {
                    clearTimeout(existingTimeout);
                }
            }
            else {
                typingUsers.set(userInfo.boardId, new Map());
            }
            socket.to(userInfo.boardId).emit("chat:typing", {
                userId: socket.userId,
                username: socket.username,
                boardId: userInfo.boardId,
            });
            const timeout = setTimeout(() => {
                socket.to(userInfo.boardId).emit("chat:stop-typing", socket.userId);
                const boardTyping = typingUsers.get(userInfo.boardId);
                if (boardTyping) {
                    boardTyping.delete(socket.userId);
                    if (boardTyping.size === 0) {
                        typingUsers.delete(userInfo.boardId);
                    }
                }
            }, 3000);
            typingUsers.get(userInfo.boardId).set(socket.userId, timeout);
        }
        catch (error) {
            errorHandler_1.logger.error("Error handling typing indicator:", error);
        }
    });
    socket.on("chat:stop-typing", () => {
        try {
            const userInfo = utils_1.userPresence.get(socket.id);
            if (!userInfo?.boardId) {
                return;
            }
            const boardTyping = typingUsers.get(userInfo.boardId);
            if (boardTyping) {
                const existingTimeout = boardTyping.get(socket.userId);
                if (existingTimeout) {
                    clearTimeout(existingTimeout);
                    boardTyping.delete(socket.userId);
                    if (boardTyping.size === 0) {
                        typingUsers.delete(userInfo.boardId);
                    }
                }
            }
            socket.to(userInfo.boardId).emit("chat:stop-typing", socket.userId);
        }
        catch (error) {
            errorHandler_1.logger.error("Error handling stop typing:", error);
        }
    });
    socket.on("disconnect", () => {
        const userInfo = utils_1.userPresence.get(socket.id);
        if (userInfo?.boardId) {
            const boardTyping = typingUsers.get(userInfo.boardId);
            if (boardTyping) {
                const existingTimeout = boardTyping.get(socket.userId);
                if (existingTimeout) {
                    clearTimeout(existingTimeout);
                    boardTyping.delete(socket.userId);
                    if (boardTyping.size === 0) {
                        typingUsers.delete(userInfo.boardId);
                    }
                }
            }
            socket.to(userInfo.boardId).emit("chat:stop-typing", socket.userId);
        }
    });
};
exports.chatHandlers = chatHandlers;
//# sourceMappingURL=chatHandlers.js.map