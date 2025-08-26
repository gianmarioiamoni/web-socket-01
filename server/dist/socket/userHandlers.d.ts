import { Server } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents, AuthenticatedSocket } from "@/types";
export declare const userHandlers: (io: Server<ClientToServerEvents, ServerToClientEvents>, socket: AuthenticatedSocket) => void;
//# sourceMappingURL=userHandlers.d.ts.map