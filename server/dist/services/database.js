"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = exports.DatabaseService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const errorHandler_1 = require("@/middleware/errorHandler");
class DatabaseService {
    static instance;
    isConnected = false;
    constructor() { }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    async connect() {
        if (this.isConnected) {
            errorHandler_1.logger.info("Database already connected");
            return;
        }
        try {
            const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/task-board";
            await mongoose_1.default.connect(mongoUri, {});
            this.isConnected = true;
            errorHandler_1.logger.info("Database connected successfully");
            mongoose_1.default.connection.on("error", (error) => {
                errorHandler_1.logger.error("Database connection error:", error);
                this.isConnected = false;
            });
            mongoose_1.default.connection.on("disconnected", () => {
                errorHandler_1.logger.warn("Database disconnected");
                this.isConnected = false;
            });
            mongoose_1.default.connection.on("reconnected", () => {
                errorHandler_1.logger.info("Database reconnected");
                this.isConnected = true;
            });
        }
        catch (error) {
            errorHandler_1.logger.error("Database connection failed:", error);
            this.isConnected = false;
            throw error;
        }
    }
    async disconnect() {
        if (!this.isConnected) {
            return;
        }
        try {
            await mongoose_1.default.disconnect();
            this.isConnected = false;
            errorHandler_1.logger.info("Database disconnected successfully");
        }
        catch (error) {
            errorHandler_1.logger.error("Error disconnecting from database:", error);
            throw error;
        }
    }
    getConnectionState() {
        const states = ["disconnected", "connected", "connecting", "disconnecting"];
        return states[mongoose_1.default.connection.readyState] || "unknown";
    }
    isReady() {
        return this.isConnected && mongoose_1.default.connection.readyState === 1;
    }
    async healthCheck() {
        try {
            await mongoose_1.default.connection.db?.admin().ping();
            return {
                status: "healthy",
                state: this.getConnectionState(),
            };
        }
        catch (error) {
            errorHandler_1.logger.error("Database health check failed:", error);
            return {
                status: "unhealthy",
                state: this.getConnectionState(),
            };
        }
    }
    async setupIndexes() {
        try {
            await mongoose_1.default.connection.db
                ?.collection("users")
                .createIndex({ email: 1 }, { unique: true });
            await mongoose_1.default.connection.db
                ?.collection("users")
                .createIndex({ username: 1 }, { unique: true });
            await mongoose_1.default.connection.db
                ?.collection("boards")
                .createIndex({ ownerId: 1 });
            await mongoose_1.default.connection.db
                ?.collection("boards")
                .createIndex({ members: 1 });
            await mongoose_1.default.connection.db
                ?.collection("columns")
                .createIndex({ boardId: 1, position: 1 });
            await mongoose_1.default.connection.db
                ?.collection("tasks")
                .createIndex({ columnId: 1, position: 1 });
            await mongoose_1.default.connection.db
                ?.collection("chatmessages")
                .createIndex({ boardId: 1, timestamp: -1 });
            errorHandler_1.logger.info("Database indexes setup completed");
        }
        catch (error) {
            errorHandler_1.logger.error("Error setting up database indexes:", error);
        }
    }
}
exports.DatabaseService = DatabaseService;
exports.database = DatabaseService.getInstance();
//# sourceMappingURL=database.js.map