"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const database_1 = require("@/services/database");
const middleware_1 = require("@/middleware");
const socket_1 = require("@/socket");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});
exports.io = io;
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use((req, res, next) => {
    middleware_1.logger.info(`${req.method} ${req.path} - ${req.ip}`);
    next();
});
app.get("/health", async (req, res) => {
    try {
        const dbHealth = await database_1.database.healthCheck();
        const health = {
            status: "ok",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: dbHealth,
            memory: process.memoryUsage(),
            environment: process.env.NODE_ENV || "development",
        };
        res.status(200).json(health);
    }
    catch (error) {
        middleware_1.logger.error("Health check failed:", error);
        res.status(503).json({
            status: "error",
            message: "Service unavailable",
        });
    }
});
app.use("/api", (req, res, next) => {
    res.json({
        message: "Task Board API",
        version: "1.0.0",
        endpoints: [
            "GET /health - Health check",
            "POST /api/auth/register - User registration",
            "POST /api/auth/login - User login",
            "GET /api/boards - Get user boards",
            "POST /api/boards - Create board",
            "WebSocket connection for real-time features",
        ],
    });
});
(0, socket_1.setupSocketHandlers)(io);
app.use(middleware_1.notFound);
app.use(middleware_1.globalErrorHandler);
const gracefulShutdown = async (signal) => {
    middleware_1.logger.info(`Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
        middleware_1.logger.info("HTTP server closed");
        try {
            await database_1.database.disconnect();
            middleware_1.logger.info("Database connection closed");
            process.exit(0);
        }
        catch (error) {
            middleware_1.logger.error("Error during shutdown:", error);
            process.exit(1);
        }
    });
    setTimeout(() => {
        middleware_1.logger.error("Could not close connections in time, forcefully shutting down");
        process.exit(1);
    }, 10000);
};
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("uncaughtException", (error) => {
    middleware_1.logger.error("Uncaught Exception:", error);
    process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
    middleware_1.logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await database_1.database.connect();
        await database_1.database.setupIndexes();
        server.listen(PORT, () => {
            middleware_1.logger.info(`🚀 Server running on port ${PORT}`);
            middleware_1.logger.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
            middleware_1.logger.info(`🔗 WebSocket server ready for connections`);
            if (process.env.NODE_ENV === "development") {
                middleware_1.logger.info(`🌐 Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
            }
        });
    }
    catch (error) {
        middleware_1.logger.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map