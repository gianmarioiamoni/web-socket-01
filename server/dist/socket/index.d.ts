import { Server } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types";
export declare const setupSocketHandlers: (io: Server<ClientToServerEvents, ServerToClientEvents>) => void;
export declare const notifyBoardMembers: (io: Server<ClientToServerEvents, ServerToClientEvents>, boardId: string, event: keyof ServerToClientEvents, data: any, excludeSocketId?: string) => void;
export { getSocketsByUserId, getOnlineUsersInBoard, userPresence, boardRooms } from "./utils";
//# sourceMappingURL=index.d.ts.map