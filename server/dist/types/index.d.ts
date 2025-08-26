import { Request } from "express";
import type { Socket } from "socket.io";
export * from "../../../shared/types";
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
    moveTask: (taskId: string, toColumnId: string, position: number) => Promise<ITask | null>;
}
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode: number);
}
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
//# sourceMappingURL=index.d.ts.map