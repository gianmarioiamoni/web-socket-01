"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveTaskSchema = exports.updateTaskSchema = exports.createTaskSchema = exports.updateColumnSchema = exports.createColumnSchema = exports.updateBoardSchema = exports.createBoardSchema = exports.loginSchema = exports.registerSchema = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
const types_1 = require("@/types");
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true,
        });
        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(", ");
            return next(new types_1.AppError(errorMessage, 400));
        }
        next();
    };
};
exports.validate = validate;
exports.registerSchema = joi_1.default.object({
    username: joi_1.default.string().alphanum().min(3).max(30).required().messages({
        "string.alphanum": "Username must contain only alphanumeric characters",
        "string.min": "Username must be at least 3 characters long",
        "string.max": "Username cannot exceed 30 characters",
        "any.required": "Username is required",
    }),
    email: joi_1.default.string().email().required().messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
    }),
    password: joi_1.default.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters long",
        "any.required": "Password is required",
    }),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
    }),
    password: joi_1.default.string().required().messages({
        "any.required": "Password is required",
    }),
});
exports.createBoardSchema = joi_1.default.object({
    title: joi_1.default.string().trim().min(1).max(100).required().messages({
        "string.min": "Board title cannot be empty",
        "string.max": "Board title cannot exceed 100 characters",
        "any.required": "Board title is required",
    }),
    description: joi_1.default.string().trim().max(500).allow("").messages({
        "string.max": "Board description cannot exceed 500 characters",
    }),
});
exports.updateBoardSchema = joi_1.default.object({
    title: joi_1.default.string().trim().min(1).max(100).messages({
        "string.min": "Board title cannot be empty",
        "string.max": "Board title cannot exceed 100 characters",
    }),
    description: joi_1.default.string().trim().max(500).allow("").messages({
        "string.max": "Board description cannot exceed 500 characters",
    }),
    members: joi_1.default.array()
        .items(joi_1.default.string().pattern(/^[0-9a-fA-F]{24}$/))
        .messages({
        "string.pattern.base": "Invalid member ID format",
    }),
});
exports.createColumnSchema = joi_1.default.object({
    title: joi_1.default.string().trim().min(1).max(50).required().messages({
        "string.min": "Column title cannot be empty",
        "string.max": "Column title cannot exceed 50 characters",
        "any.required": "Column title is required",
    }),
    position: joi_1.default.number().integer().min(0).messages({
        "number.integer": "Position must be an integer",
        "number.min": "Position cannot be negative",
    }),
});
exports.updateColumnSchema = joi_1.default.object({
    title: joi_1.default.string().trim().min(1).max(50).messages({
        "string.min": "Column title cannot be empty",
        "string.max": "Column title cannot exceed 50 characters",
    }),
    position: joi_1.default.number().integer().min(0).messages({
        "number.integer": "Position must be an integer",
        "number.min": "Position cannot be negative",
    }),
});
exports.createTaskSchema = joi_1.default.object({
    title: joi_1.default.string().trim().min(1).max(200).required().messages({
        "string.min": "Task title cannot be empty",
        "string.max": "Task title cannot exceed 200 characters",
        "any.required": "Task title is required",
    }),
    description: joi_1.default.string().trim().max(1000).allow("").messages({
        "string.max": "Task description cannot exceed 1000 characters",
    }),
    assigneeId: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .allow(null)
        .messages({
        "string.pattern.base": "Invalid assignee ID format",
    }),
    priority: joi_1.default.string()
        .valid("low", "medium", "high")
        .default("medium")
        .messages({
        "any.only": "Priority must be low, medium, or high",
    }),
    dueDate: joi_1.default.date().greater("now").allow(null).messages({
        "date.greater": "Due date must be in the future",
    }),
    position: joi_1.default.number().integer().min(0).messages({
        "number.integer": "Position must be an integer",
        "number.min": "Position cannot be negative",
    }),
});
exports.updateTaskSchema = joi_1.default.object({
    title: joi_1.default.string().trim().min(1).max(200).messages({
        "string.min": "Task title cannot be empty",
        "string.max": "Task title cannot exceed 200 characters",
    }),
    description: joi_1.default.string().trim().max(1000).allow("").messages({
        "string.max": "Task description cannot exceed 1000 characters",
    }),
    assigneeId: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .allow(null)
        .messages({
        "string.pattern.base": "Invalid assignee ID format",
    }),
    priority: joi_1.default.string().valid("low", "medium", "high").messages({
        "any.only": "Priority must be low, medium, or high",
    }),
    dueDate: joi_1.default.date().greater("now").allow(null).messages({
        "date.greater": "Due date must be in the future",
    }),
});
exports.moveTaskSchema = joi_1.default.object({
    toColumnId: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
        "string.pattern.base": "Invalid column ID format",
        "any.required": "Destination column ID is required",
    }),
    position: joi_1.default.number().integer().min(0).required().messages({
        "number.integer": "Position must be an integer",
        "number.min": "Position cannot be negative",
        "any.required": "Position is required",
    }),
});
//# sourceMappingURL=validation.js.map