import mongoose from "mongoose";
import { logger } from "@/middleware/errorHandler";

export class DatabaseService {
  private static instance: DatabaseService;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info("Database already connected");
      return;
    }

    try {
      const mongoUri =
        process.env.MONGODB_URI || "mongodb://localhost:27017/task-board";

      await mongoose.connect(mongoUri, {
        // Remove deprecated options
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      });

      this.isConnected = true;
      logger.info("Database connected successfully");

      // Handle connection events
      mongoose.connection.on("error", (error) => {
        logger.error("Database connection error:", error);
        this.isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        logger.warn("Database disconnected");
        this.isConnected = false;
      });

      mongoose.connection.on("reconnected", () => {
        logger.info("Database reconnected");
        this.isConnected = true;
      });
    } catch (error) {
      logger.error("Database connection failed:", error);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info("Database disconnected successfully");
    } catch (error) {
      logger.error("Error disconnecting from database:", error);
      throw error;
    }
  }

  public getConnectionState(): string {
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    return states[mongoose.connection.readyState] || "unknown";
  }

  public isReady(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  // Health check method
  public async healthCheck(): Promise<{ status: string; state: string }> {
    try {
      await mongoose.connection.db?.admin().ping();
      return {
        status: "healthy",
        state: this.getConnectionState(),
      };
    } catch (error) {
      logger.error("Database health check failed:", error);
      return {
        status: "unhealthy",
        state: this.getConnectionState(),
      };
    }
  }

  // Setup indexes for better performance
  public async setupIndexes(): Promise<void> {
    try {
      // This will ensure all schema indexes are created
      await mongoose.connection.db
        ?.collection("users")
        .createIndex({ email: 1 }, { unique: true });
      await mongoose.connection.db
        ?.collection("users")
        .createIndex({ username: 1 }, { unique: true });
      await mongoose.connection.db
        ?.collection("boards")
        .createIndex({ ownerId: 1 });
      await mongoose.connection.db
        ?.collection("boards")
        .createIndex({ members: 1 });
      await mongoose.connection.db
        ?.collection("columns")
        .createIndex({ boardId: 1, position: 1 });
      await mongoose.connection.db
        ?.collection("tasks")
        .createIndex({ columnId: 1, position: 1 });
      await mongoose.connection.db
        ?.collection("chatmessages")
        .createIndex({ boardId: 1, timestamp: -1 });

      logger.info("Database indexes setup completed");
    } catch (error) {
      logger.error("Error setting up database indexes:", error);
    }
  }
}

export const database = DatabaseService.getInstance();
