import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/types";
export declare const authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authenticateSocket: (socket: any, next: (err?: Error) => void) => Promise<void>;
export declare const generateTokens: (user: {
    id: string;
    username: string;
    email: string;
}) => {
    accessToken: never;
    refreshToken: never;
};
export declare const verifyRefreshToken: (token: string) => {
    id: string;
};
//# sourceMappingURL=auth.d.ts.map