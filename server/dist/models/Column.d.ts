import mongoose, { Document } from "mongoose";
import { IColumn } from "@/types";
interface IColumnDocument extends IColumn, Document {
}
export declare const Column: mongoose.Model<IColumnDocument, {}, {}, {}, mongoose.Document<unknown, {}, IColumnDocument, {}, {}> & IColumnDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export type { IColumnDocument };
//# sourceMappingURL=Column.d.ts.map