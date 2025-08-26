"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const taskSchema = new mongoose_1.Schema({
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
            validator: function (value) {
                if (value === null)
                    return true;
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
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
taskSchema.index({ columnId: 1, position: 1 });
taskSchema.index({ columnId: 1 });
taskSchema.index({ assigneeId: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ columnId: 1, position: 1 }, { unique: true });
taskSchema.statics.findByColumn = function (columnId) {
    return this.find({ columnId }).sort({ position: 1 });
};
taskSchema.statics.findByAssignee = function (assigneeId) {
    return this.find({ assigneeId }).sort({ createdAt: -1 });
};
taskSchema.statics.findByCreator = function (createdBy) {
    return this.find({ createdBy }).sort({ createdAt: -1 });
};
taskSchema.statics.getNextPosition = async function (columnId) {
    const lastTask = await this.findOne({ columnId }).sort({ position: -1 });
    return lastTask ? lastTask.position + 1 : 0;
};
taskSchema.methods.isOverdue = function () {
    if (!this.dueDate)
        return false;
    return new Date() > this.dueDate;
};
taskSchema.methods.getDaysUntilDue = function () {
    if (!this.dueDate)
        return null;
    const diffTime = this.dueDate.getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
taskSchema.pre("save", async function (next) {
    if (this.isNew && (this.position === undefined || this.position === null)) {
        try {
            const model = this.constructor;
            this.position = await model.getNextPosition(this.columnId);
            next();
        }
        catch (error) {
            next(error);
        }
    }
    else {
        next();
    }
});
exports.Task = mongoose_1.default.model("Task", taskSchema);
//# sourceMappingURL=Task.js.map