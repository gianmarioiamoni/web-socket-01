import mongoose, { Schema, Document } from "mongoose";
import { Task as ITask } from "../../../shared/types";

interface ITaskDocument extends Omit<ITask, "id">, Document {
  id: string;
}

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [1, "Task title cannot be empty"],
      maxlength: [200, "Task title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Task description cannot exceed 1000 characters"],
    },
    assigneeId: {
      type: String,
      ref: "User",
      default: null,
    },
    columnId: {
      type: String,
      required: [true, "Column ID is required"],
      ref: "Column",
    },
    position: {
      type: Number,
      required: [true, "Task position is required"],
      min: [0, "Task position cannot be negative"],
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority must be low, medium, or high",
      },
      default: "medium",
    },
    dueDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (value: Date | null) {
          if (value === null) return true;
          return value > new Date();
        },
        message: "Due date must be in the future",
      },
    },
    createdBy: {
      type: String,
      required: [true, "Created by is required"],
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc: any, ret: any) {
        ret.id = ret._id.toString();
        // Use destructuring to avoid delete operator errors
        const { _id, __v, ...cleanRet } = ret;
        return { id: ret.id, ...cleanRet };
      },
    },
  }
);

// Indexes for better query performance
taskSchema.index({ columnId: 1, position: 1 });
taskSchema.index({ columnId: 1 });
taskSchema.index({ assigneeId: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });

// Ensure unique position per column
taskSchema.index({ columnId: 1, position: 1 }, { unique: true });

// Static methods
taskSchema.statics.findByColumn = function (columnId: string) {
  return this.find({ columnId }).sort({ position: 1 });
};

taskSchema.statics.findByAssignee = function (assigneeId: string) {
  return this.find({ assigneeId }).sort({ createdAt: -1 });
};

taskSchema.statics.findByCreator = function (createdBy: string) {
  return this.find({ createdBy }).sort({ createdAt: -1 });
};

taskSchema.statics.getNextPosition = async function (
  columnId: string
): Promise<number> {
  const lastTask = await this.findOne({ columnId }).sort({ position: -1 });
  return lastTask ? lastTask.position + 1 : 0;
};

// Instance methods
taskSchema.methods.isOverdue = function (): boolean {
  const task = this as any;
  if (!task.dueDate) return false;
  return new Date() > task.dueDate;
};

taskSchema.methods.getDaysUntilDue = function (): number | null {
  const task = this as any;
  if (!task.dueDate) return null;
  const diffTime = task.dueDate.getTime() - new Date().getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Pre-save middleware to auto-assign position if not provided
taskSchema.pre("save", async function (next) {
  const task = this as any;
  if (task.isNew && (task.position === undefined || task.position === null)) {
    try {
      const model = task.constructor as any;
      task.position = await model.getNextPosition(task.columnId);
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

export const Task = mongoose.model<ITaskDocument>("Task", taskSchema);
export type { ITaskDocument };
