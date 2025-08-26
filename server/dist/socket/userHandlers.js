"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userHandlers = void 0;
const errorHandler_1 = require("@/middleware/errorHandler");
const utils_1 = require("./utils");
const userHandlers = (io, socket) => {
    socket.on("user:cursor", (cursor) => {
        try {
            const userInfo = utils_1.userPresence.get(socket.id);
            if (!userInfo?.boardId) {
                return;
            }
            userInfo.lastSeen = new Date();
            socket.to(userInfo.boardId).emit("user:cursor", {
                userId: socket.userId,
                username: socket.username,
                avatar: socket.userData?.avatar,
                boardId: userInfo.boardId,
                cursor,
            });
        }
        catch (error) {
            errorHandler_1.logger.error("Error handling cursor movement:", error);
        }
    });
    socket.on("ping", () => {
        try {
            const userInfo = utils_1.userPresence.get(socket.id);
            if (userInfo) {
                userInfo.lastSeen = new Date();
            }
            socket.emit("pong");
        }
        catch (error) {
            errorHandler_1.logger.error("Error handling ping:", error);
        }
    });
};
exports.userHandlers = userHandlers;
//# sourceMappingURL=userHandlers.js.map