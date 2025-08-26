import type { UserPresence } from "@/types";
export declare const userPresence: Map<string, {
    socketId: string;
    userId: string;
    username: string;
    avatar?: string;
    boardId?: string;
    lastSeen: Date;
}>;
export declare const boardRooms: Map<string, Set<string>>;
export declare const getSocketsByUserId: (userId: string) => string[];
export declare const getOnlineUsersInBoard: (boardId: string) => UserPresence[];
//# sourceMappingURL=utils.d.ts.map