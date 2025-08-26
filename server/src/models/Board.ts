import mongoose, { Schema, Document } from "mongoose";
import { Board as IBoard } from "../../../shared/types";

interface IBoardDocument extends Omit<IBoard, "id">, Document {
  id: string;
}

const boardSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Board title is required"],
      trim: true,
      minlength: [1, "Board title cannot be empty"],
      maxlength: [100, "Board title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Board description cannot exceed 500 characters"],
    },
    ownerId: {
      type: String,
      required: [true, "Board owner is required"],
      ref: "User",
    },
    members: [
      {
        type: String,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
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
boardSchema.index({ ownerId: 1 });
boardSchema.index({ members: 1 });
boardSchema.index({ createdAt: -1 });

// Pre-save middleware to ensure owner is in members
boardSchema.pre("save", function (next) {
  const board = this as any;
  if (!board.members.includes(board.ownerId)) {
    board.members.push(board.ownerId);
  }
  next();
});

// Static methods
boardSchema.statics.findByOwner = function (ownerId: string) {
  return this.find({ ownerId }).sort({ createdAt: -1 });
};

boardSchema.statics.findByMember = function (userId: string) {
  return this.find({ members: userId }).sort({ createdAt: -1 });
};

boardSchema.statics.findUserBoards = function (userId: string) {
  return this.find({
    $or: [{ ownerId: userId }, { members: userId }],
  }).sort({ createdAt: -1 });
};

export const Board = mongoose.model<IBoardDocument>("Board", boardSchema);
export type { IBoardDocument };
