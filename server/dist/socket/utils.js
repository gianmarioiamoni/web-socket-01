"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnlineUsersInBoard = exports.getSocketsByUserId = exports.boardRooms = exports.userPresence = void 0;
exports.userPresence = new Map();
exports.boardRooms = new Map();
const getSocketsByUserId = (userId) => {
    const sockets = [];
    exports.userPresence.forEach((user, socketId) => {
        if (user.userId === userId) {
            sockets.push(socketId);
        }
    });
    return sockets;
};
exports.getSocketsByUserId = getSocketsByUserId;
const getOnlineUsersInBoard = (boardId) => {
    const boardUsers = exports.boardRooms.get(boardId);
    if (!boardUsers)
        return [];
    return Array.from(boardUsers)
        .map((socketId) => exports.userPresence.get(socketId))
        .filter((user) => user !== undefined)
        .map((user) => ({
        userId: user.userId,
        username: user.username,
        ...(user.avatar && { avatar: user.avatar }),
        boardId: user.boardId,
    }));
};
exports.getOnlineUsersInBoard = getOnlineUsersInBoard;
//# sourceMappingURL=utils.js.map