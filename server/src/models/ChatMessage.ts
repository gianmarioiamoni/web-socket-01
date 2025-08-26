import mongoose, { Schema, Document } from "mongoose";
import { ChatMessage as IChatMessage } from "../../../shared/types";

interface IChatMessageDocument extends Omit<IChatMessage, "id">, Document {
  id: string;
}

const chatMessageSchema = new Schema(
  {
    boardId: {
      type: String,
      required: [true, "Board ID is required"],
      ref: "Board",
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
      ref: "User",
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [1000, "Message content cannot exceed 1000 characters"],
    },
    type: {
      type: String,
      enum: {
        values: ["text", "system"],
        message: "Message type must be text or system",
      },
      default: "text",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      transform: function (doc: any, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for better query performance
chatMessageSchema.index({ boardId: 1, timestamp: -1 });
chatMessageSchema.index({ boardId: 1 });
chatMessageSchema.index({ userId: 1 });
chatMessageSchema.index({ timestamp: -1 });

// Static methods
chatMessageSchema.statics.findByBoard = function (
  boardId: string,
  limit = 50,
  skip = 0
) {
  return this.find({ boardId }).sort({ timestamp: -1 }).limit(limit).skip(skip);
};

chatMessageSchema.statics.findRecentByBoard = function (
  boardId: string,
  limit = 50
) {
  return this.find({ boardId }).sort({ timestamp: -1 }).limit(limit);
};

chatMessageSchema.statics.findByUser = function (userId: string, limit = 100) {
  return this.find({ userId }).sort({ timestamp: -1 }).limit(limit);
};

// Create system message helper
chatMessageSchema.statics.createSystemMessage = function (
  boardId: string,
  content: string
) {
  return this.create({
    boardId,
    userId: "system",
    username: "System",
    content,
    type: "system",
    timestamp: new Date(),
  });
};

export const ChatMessage = mongoose.model<IChatMessageDocument>(
  "ChatMessage",
  chatMessageSchema
);
export type { IChatMessageDocument };
