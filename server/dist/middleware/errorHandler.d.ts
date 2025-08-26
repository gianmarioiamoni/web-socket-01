import { Request, Response, NextFunction } from "express";
import winston from "winston";
declare const logger: winston.Logger;
export declare const globalErrorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
export declare const notFound: (req: Request, res: Response, next: NextFunction) => void;
export declare const catchAsync: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export { logger };
//# sourceMappingURL=errorHandler.d.ts.map