import type { UserPresence } from "../types";

// Store for tracking user presence
export const userPresence = new Map<
  string,
  {
    socketId: string;
    userId: string;
    username: string;
    avatar?: string;
    boardId?: string;
    lastSeen: Date;
  }
>();

// Store for tracking board rooms
export const boardRooms = new Map<string, Set<string>>();

// Utility functions for socket operations
export const getSocketsByUserId = (userId: string): string[] => {
  const sockets: string[] = [];
  userPresence.forEach((user, socketId) => {
    if (user.userId === userId) {
      sockets.push(socketId);
    }
  });
  return sockets;
};

export const getOnlineUsersInBoard = (boardId: string): UserPresence[] => {
  const boardUsers = boardRooms.get(boardId);
  if (!boardUsers) return [];

  return Array.from(boardUsers)
    .map((socketId) => userPresence.get(socketId))
    .filter((user) => user !== undefined)
    .map((user) => ({
      userId: user!.userId,
      username: user!.username,
      ...(user!.avatar && { avatar: user!.avatar }),
      boardId: user!.boardId!,
    }));
};
