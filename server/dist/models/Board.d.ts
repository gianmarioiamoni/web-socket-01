import mongoose, { Document } from "mongoose";
import { IBoard } from "@/types";
interface IBoardDocument extends IBoard, Document {
}
export declare const Board: mongoose.Model<IBoardDocument, {}, {}, {}, mongoose.Document<unknown, {}, IBoardDocument, {}, {}> & IBoardDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export type { IBoardDocument };
//# sourceMappingURL=Board.d.ts.map