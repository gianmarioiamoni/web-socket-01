import { Server } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents, AuthenticatedSocket } from "@/types";
export declare const chatHandlers: (io: Server<ClientToServerEvents, ServerToClientEvents>, socket: AuthenticatedSocket) => void;
//# sourceMappingURL=chatHandlers.d.ts.map