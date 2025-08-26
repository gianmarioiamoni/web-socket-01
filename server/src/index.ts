import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { database } from "@/services/database";
import { globalErrorHandler, notFound, logger } from "@/middleware";
import { setupSocketHandlers } from "@/socket";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types";

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io setup with TypeScript support
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealth,
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || "development",
    };

    res.status(200).json(health);
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(503).json({
      status: "error",
      message: "Service unavailable",
    });
  }
});

// API Routes
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

// TODO: Add API routes here
// app.use('/api/auth', authRoutes);
// app.use('/api/boards', boardRoutes);
// app.use('/api/tasks', taskRoutes);

// Setup Socket.io handlers
setupSocketHandlers(io);

// Error handling middleware
app.use(notFound);
app.use(globalErrorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      await database.disconnect();
      logger.info("Database connection closed");
      process.exit(0);
    } catch (error) {
      logger.error("Error during shutdown:", error);
      process.exit(1);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await database.connect();
    await database.setupIndexes();

    // Start HTTP server
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`🔗 WebSocket server ready for connections`);

      if (process.env.NODE_ENV === "development") {
        logger.info(
          `🌐 Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`
        );
      }
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export { app, io };
