import mongoose, { Document } from "mongoose";
import { ITask } from "@/types";
interface ITaskDocument extends ITask, Document {
}
export declare const Task: mongoose.Model<ITaskDocument, {}, {}, {}, mongoose.Document<unknown, {}, ITaskDocument, {}, {}> & ITaskDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export type { ITaskDocument };
//# sourceMappingURL=Task.d.ts.map