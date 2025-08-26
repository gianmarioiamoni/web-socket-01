import mongoose, { Document } from "mongoose";
import { IUser } from "@/types";
interface IUserDocument extends IUser, Document {
    comparePassword(candidatePassword: string): Promise<boolean>;
    toSafeObject(): Omit<IUser, "password">;
}
export declare const User: mongoose.Model<IUserDocument, {}, {}, {}, mongoose.Document<unknown, {}, IUserDocument, {}, {}> & IUserDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export type { IUserDocument };
//# sourceMappingURL=User.d.ts.map