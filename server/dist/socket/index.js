"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boardRooms = exports.userPresence = exports.getOnlineUsersInBoard = exports.getSocketsByUserId = exports.notifyBoardMembers = exports.setupSocketHandlers = void 0;
const auth_1 = require("@/middleware/auth");
const errorHandler_1 = require("@/middleware/errorHandler");
const utils_1 = require("./utils");
const boardHandlers_1 = require("./boardHandlers");
const taskHandlers_1 = require("./taskHandlers");
const chatHandlers_1 = require("./chatHandlers");
const userHandlers_1 = require("./userHandlers");
const setupSocketHandlers = (io) => {
    io.use(auth_1.authenticateSocket);
    io.on("connection", (socket) => {
        errorHandler_1.logger.info(`User connected: ${socket.username} (${socket.userId})`);
        utils_1.userPresence.set(socket.id, {
            socketId: socket.id,
            userId: socket.userId,
            username: socket.username,
            avatar: socket.userData?.avatar || undefined,
            lastSeen: new Date(),
        });
        (0, boardHandlers_1.boardHandlers)(io, socket);
        (0, taskHandlers_1.taskHandlers)(io, socket);
        (0, chatHandlers_1.chatHandlers)(io, socket);
        (0, userHandlers_1.userHandlers)(io, socket);
        socket.on("disconnect", (reason) => {
            errorHandler_1.logger.info(`User disconnected: ${socket.username} (${reason})`);
            const userInfo = utils_1.userPresence.get(socket.id);
            if (userInfo && userInfo.boardId) {
                const boardUsers = utils_1.boardRooms.get(userInfo.boardId);
                if (boardUsers) {
                    boardUsers.delete(socket.id);
                    if (boardUsers.size === 0) {
                        utils_1.boardRooms.delete(userInfo.boardId);
                    }
                }
                socket.to(userInfo.boardId).emit("user:left", userInfo.userId);
                const onlineUsers = (0, utils_1.getOnlineUsersInBoard)(userInfo.boardId);
                io.to(userInfo.boardId).emit("users:online", onlineUsers);
            }
            utils_1.userPresence.delete(socket.id);
        });
        socket.on("error", (error) => {
            errorHandler_1.logger.error(`Socket error for user ${socket.username}:`, error);
        });
        socket.emit("notification", {
            type: "success",
            message: "Connected to real-time server",
        });
    });
    io.engine.on("connection_error", (error) => {
        errorHandler_1.logger.error("Socket.io connection error:", error);
    });
    errorHandler_1.logger.info("Socket.io handlers configured successfully");
};
exports.setupSocketHandlers = setupSocketHandlers;
const notifyBoardMembers = (io, boardId, event, data, excludeSocketId) => {
    if (excludeSocketId) {
        io.to(boardId)
            .except(excludeSocketId)
            .emit(event, data);
    }
    else {
        io.to(boardId).emit(event, data);
    }
};
exports.notifyBoardMembers = notifyBoardMembers;
var utils_2 = require("./utils");
Object.defineProperty(exports, "getSocketsByUserId", { enumerable: true, get: function () { return utils_2.getSocketsByUserId; } });
Object.defineProperty(exports, "getOnlineUsersInBoard", { enumerable: true, get: function () { return utils_2.getOnlineUsersInBoard; } });
Object.defineProperty(exports, "userPresence", { enumerable: true, get: function () { return utils_2.userPresence; } });
Object.defineProperty(exports, "boardRooms", { enumerable: true, get: function () { return utils_2.boardRooms; } });
//# sourceMappingURL=index.js.map