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
exports.Column = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const columnSchema = new mongoose_1.Schema({
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
columnSchema.index({ boardId: 1, position: 1 });
columnSchema.index({ boardId: 1 });
columnSchema.index({ boardId: 1, position: 1 }, { unique: true });
columnSchema.statics.findByBoard = function (boardId) {
    return this.find({ boardId }).sort({ position: 1 });
};
columnSchema.statics.getNextPosition = async function (boardId) {
    const lastColumn = await this.findOne({ boardId }).sort({ position: -1 });
    return lastColumn ? lastColumn.position + 1 : 0;
};
columnSchema.pre("save", async function (next) {
    if (this.isNew && (this.position === undefined || this.position === null)) {
        try {
            const model = this.constructor;
            this.position = await model.getNextPosition(this.boardId);
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
exports.Column = mongoose_1.default.model("Column", columnSchema);
//# sourceMappingURL=Column.js.map