import { Request } from "express";
import type { Socket } from "socket.io";

// Re-export shared types
export * from "../../../shared/types";

// Server-specific types
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
  boardId?: string;
  userData?: SocketUserData;
}

export interface SocketUserData {
  userId: string;
  username: string;
  avatar?: string;
}

// Database Model Types (Mongoose)
export interface IUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBoard {
  _id: string;
  title: string;
  description?: string;
  ownerId: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IColumn {
  _id: string;
  title: string;
  position: number;
  boardId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  assigneeId?: string;
  columnId: string;
  position: number;
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface IChatMessage {
  _id: string;
  boardId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  type: "text" | "system";
}

// Service Types
export interface BoardService {
  createBoard: (boardData: any) => Promise<IBoard>;
  getBoardById: (boardId: string) => Promise<IBoard | null>;
  updateBoard: (boardId: string, updates: any) => Promise<IBoard | null>;
  deleteBoard: (boardId: string) => Promise<boolean>;
  getUserBoards: (userId: string) => Promise<IBoard[]>;
}

export interface TaskService {
  createTask: (taskData: any) => Promise<ITask>;
  getTaskById: (taskId: string) => Promise<ITask | null>;
  updateTask: (taskId: string, updates: any) => Promise<ITask | null>;
  deleteTask: (taskId: string) => Promise<boolean>;
  getTasksByColumn: (columnId: string) => Promise<ITask[]>;
  moveTask: (
    taskId: string,
    toColumnId: string,
    position: number
  ) => Promise<ITask | null>;
}

// Error Types
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}
