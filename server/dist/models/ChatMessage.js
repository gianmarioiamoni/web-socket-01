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
exports.ChatMessage = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const chatMessageSchema = new mongoose_1.Schema({
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
}, {
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
chatMessageSchema.index({ boardId: 1, timestamp: -1 });
chatMessageSchema.index({ boardId: 1 });
chatMessageSchema.index({ userId: 1 });
chatMessageSchema.index({ timestamp: -1 });
chatMessageSchema.statics.findByBoard = function (boardId, limit = 50, skip = 0) {
    return this.find({ boardId }).sort({ timestamp: -1 }).limit(limit).skip(skip);
};
chatMessageSchema.statics.findRecentByBoard = function (boardId, limit = 50) {
    return this.find({ boardId }).sort({ timestamp: -1 }).limit(limit);
};
chatMessageSchema.statics.findByUser = function (userId, limit = 100) {
    return this.find({ userId }).sort({ timestamp: -1 }).limit(limit);
};
chatMessageSchema.statics.createSystemMessage = function (boardId, content) {
    return this.create({
        boardId,
        userId: "system",
        username: "System",
        content,
        type: "system",
        timestamp: new Date(),
    });
};
exports.ChatMessage = mongoose_1.default.model("ChatMessage", chatMessageSchema);
//# sourceMappingURL=ChatMessage.js.map