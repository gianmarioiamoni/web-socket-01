import { Server } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types";
declare const app: import("express-serve-static-core").Express;
declare const io: Server<ClientToServerEvents, ServerToClientEvents, import("socket.io").DefaultEventsMap, any>;
export { app, io };
//# sourceMappingURL=index.d.ts.map