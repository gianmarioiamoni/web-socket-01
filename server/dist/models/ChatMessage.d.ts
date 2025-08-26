import mongoose, { Document } from "mongoose";
import { IChatMessage } from "@/types";
interface IChatMessageDocument extends IChatMessage, Document {
}
export declare const ChatMessage: mongoose.Model<IChatMessageDocument, {}, {}, {}, mongoose.Document<unknown, {}, IChatMessageDocument, {}, {}> & IChatMessageDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export type { IChatMessageDocument };
//# sourceMappingURL=ChatMessage.d.ts.map