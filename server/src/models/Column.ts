import mongoose, { Schema, Document } from "mongoose";
import { Column as IColumn } from "../../../shared/types";

interface IColumnDocument extends Omit<IColumn, "id">, Document {
  id: string;
}

const columnSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Column title is required"],
      trim: true,
      minlength: [1, "Column title cannot be empty"],
      maxlength: [50, "Column title cannot exceed 50 characters"],
    },
    position: {
      type: Number,
      required: [true, "Column position is required"],
      min: [0, "Column position cannot be negative"],
    },
    boardId: {
      type: String,
      required: [true, "Board ID is required"],
      ref: "Board",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc: any, ret: any) {
        ret.id = ret._id.toString();
        // Make properties optional for deletion
        const { _id, __v, ...cleanRet } = ret;
        return { id: ret.id, ...cleanRet };
      },
    },
  }
);

// Indexes for better query performance
columnSchema.index({ boardId: 1, position: 1 });
columnSchema.index({ boardId: 1 });

// Ensure unique position per board
columnSchema.index({ boardId: 1, position: 1 }, { unique: true });

// Static methods
columnSchema.statics.findByBoard = function (boardId: string) {
  return this.find({ boardId }).sort({ position: 1 });
};

columnSchema.statics.getNextPosition = async function (
  boardId: string
): Promise<number> {
  const lastColumn = await this.findOne({ boardId }).sort({ position: -1 });
  return lastColumn ? lastColumn.position + 1 : 0;
};

// Pre-save middleware to auto-assign position if not provided
columnSchema.pre("save", async function (next) {
  const column = this as any;
  if (
    column.isNew &&
    (column.position === undefined || column.position === null)
  ) {
    try {
      const model = column.constructor as any;
      column.position = await model.getNextPosition(column.boardId);
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

export const Column = mongoose.model<IColumnDocument>("Column", columnSchema);
export type { IColumnDocument };
