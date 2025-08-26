// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface UserPresence {
  userId: string;
  username: string;
  avatar?: string;
  boardId: string;
  cursor?: {
    x: number;
    y: number;
  };
}

// Board Types
export interface Board {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  members: string[];
  columns: Column[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  title: string;
  position: number;
  boardId: string;
  tasks: Task[];
}

export interface Task {
  id: string;
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

// Chat Types
export interface ChatMessage {
  id: string;
  boardId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  type: "text" | "system";
}

export interface TypingIndicator {
  userId: string;
  username: string;
  boardId: string;
}

// Socket Event Types
export interface ServerToClientEvents {
  // Board events
  "board:updated": (board: Board) => void;
  "task:created": (task: Task) => void;
  "task:updated": (task: Task) => void;
  "task:deleted": (taskId: string) => void;
  "task:moved": (
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    position: number
  ) => void;

  // Column events
  "column:created": (column: Column) => void;
  "column:updated": (column: Column) => void;
  "column:deleted": (columnId: string) => void;

  // User events
  "user:joined": (user: UserPresence) => void;
  "user:left": (userId: string) => void;
  "user:cursor": (cursor: UserPresence) => void;
  "users:online": (users: UserPresence[]) => void;

  // Chat events
  "chat:message": (message: ChatMessage) => void;
  "chat:typing": (typing: TypingIndicator) => void;
  "chat:stop-typing": (userId: string) => void;

  // System events
  error: (error: { message: string; code?: string }) => void;
  notification: (notification: {
    type: "info" | "success" | "warning" | "error";
    message: string;
  }) => void;
}

export interface ClientToServerEvents {
  // Board events
  "board:join": (boardId: string) => void;
  "board:leave": (boardId: string) => void;
  "board:update": (boardId: string, updates: Partial<Board>) => void;

  // Task events
  "task:create": (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  "task:update": (taskId: string, updates: Partial<Task>) => void;
  "task:delete": (taskId: string) => void;
  "task:move": (taskId: string, toColumnId: string, position: number) => void;

  // Column events
  "column:create": (column: Omit<Column, "id" | "tasks">) => void;
  "column:update": (columnId: string, updates: Partial<Column>) => void;
  "column:delete": (columnId: string) => void;

  // User events
  "user:cursor": (cursor: { x: number; y: number }) => void;

  // Chat events
  "chat:send": (
    message: Omit<ChatMessage, "id" | "timestamp" | "userId" | "username">
  ) => void;
  "chat:typing": () => void;
  "chat:stop-typing": () => void;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Validation Schemas Types
export interface CreateTaskRequest {
  title: string;
  description?: string;
  columnId: string;
  assigneeId?: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  assigneeId?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
}

export interface CreateBoardRequest {
  title: string;
  description?: string;
}

export interface UpdateBoardRequest {
  title?: string;
  description?: string;
  members?: string[];
}
