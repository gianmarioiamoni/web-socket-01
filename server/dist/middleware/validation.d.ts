import Joi from "joi";
import { Request, Response, NextFunction } from "express";
export declare const validate: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const registerSchema: Joi.ObjectSchema<any>;
export declare const loginSchema: Joi.ObjectSchema<any>;
export declare const createBoardSchema: Joi.ObjectSchema<any>;
export declare const updateBoardSchema: Joi.ObjectSchema<any>;
export declare const createColumnSchema: Joi.ObjectSchema<any>;
export declare const updateColumnSchema: Joi.ObjectSchema<any>;
export declare const createTaskSchema: Joi.ObjectSchema<any>;
export declare const updateTaskSchema: Joi.ObjectSchema<any>;
export declare const moveTaskSchema: Joi.ObjectSchema<any>;
//# sourceMappingURL=validation.d.ts.map