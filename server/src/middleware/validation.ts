import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { AppError } from "@/types";

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      return next(new AppError(errorMessage, 400));
    }

    next();
  };
};

// Auth validation schemas
export const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    "string.alphanum": "Username must contain only alphanumeric characters",
    "string.min": "Username must be at least 3 characters long",
    "string.max": "Username cannot exceed 30 characters",
    "any.required": "Username is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

// Board validation schemas
export const createBoardSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required().messages({
    "string.min": "Board title cannot be empty",
    "string.max": "Board title cannot exceed 100 characters",
    "any.required": "Board title is required",
  }),
  description: Joi.string().trim().max(500).allow("").messages({
    "string.max": "Board description cannot exceed 500 characters",
  }),
});

export const updateBoardSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).messages({
    "string.min": "Board title cannot be empty",
    "string.max": "Board title cannot exceed 100 characters",
  }),
  description: Joi.string().trim().max(500).allow("").messages({
    "string.max": "Board description cannot exceed 500 characters",
  }),
  members: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .messages({
      "string.pattern.base": "Invalid member ID format",
    }),
});

// Column validation schemas
export const createColumnSchema = Joi.object({
  title: Joi.string().trim().min(1).max(50).required().messages({
    "string.min": "Column title cannot be empty",
    "string.max": "Column title cannot exceed 50 characters",
    "any.required": "Column title is required",
  }),
  position: Joi.number().integer().min(0).messages({
    "number.integer": "Position must be an integer",
    "number.min": "Position cannot be negative",
  }),
});

export const updateColumnSchema = Joi.object({
  title: Joi.string().trim().min(1).max(50).messages({
    "string.min": "Column title cannot be empty",
    "string.max": "Column title cannot exceed 50 characters",
  }),
  position: Joi.number().integer().min(0).messages({
    "number.integer": "Position must be an integer",
    "number.min": "Position cannot be negative",
  }),
});

// Task validation schemas
export const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required().messages({
    "string.min": "Task title cannot be empty",
    "string.max": "Task title cannot exceed 200 characters",
    "any.required": "Task title is required",
  }),
  description: Joi.string().trim().max(1000).allow("").messages({
    "string.max": "Task description cannot exceed 1000 characters",
  }),
  assigneeId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null)
    .messages({
      "string.pattern.base": "Invalid assignee ID format",
    }),
  priority: Joi.string()
    .valid("low", "medium", "high")
    .default("medium")
    .messages({
      "any.only": "Priority must be low, medium, or high",
    }),
  dueDate: Joi.date().greater("now").allow(null).messages({
    "date.greater": "Due date must be in the future",
  }),
  position: Joi.number().integer().min(0).messages({
    "number.integer": "Position must be an integer",
    "number.min": "Position cannot be negative",
  }),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).messages({
    "string.min": "Task title cannot be empty",
    "string.max": "Task title cannot exceed 200 characters",
  }),
  description: Joi.string().trim().max(1000).allow("").messages({
    "string.max": "Task description cannot exceed 1000 characters",
  }),
  assigneeId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null)
    .messages({
      "string.pattern.base": "Invalid assignee ID format",
    }),
  priority: Joi.string().valid("low", "medium", "high").messages({
    "any.only": "Priority must be low, medium, or high",
  }),
  dueDate: Joi.date().greater("now").allow(null).messages({
    "date.greater": "Due date must be in the future",
  }),
});

export const moveTaskSchema = Joi.object({
  toColumnId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid column ID format",
      "any.required": "Destination column ID is required",
    }),
  position: Joi.number().integer().min(0).required().messages({
    "number.integer": "Position must be an integer",
    "number.min": "Position cannot be negative",
    "any.required": "Position is required",
  }),
});
