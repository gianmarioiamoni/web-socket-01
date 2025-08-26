import { Server } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents, AuthenticatedSocket } from "@/types";
export declare const taskHandlers: (io: Server<ClientToServerEvents, ServerToClientEvents>, socket: AuthenticatedSocket) => void;
//# sourceMappingURL=taskHandlers.d.ts.map