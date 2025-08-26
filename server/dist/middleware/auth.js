"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.generateTokens = exports.authenticateSocket = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const types_1 = require("@/types");
const models_1 = require("@/models");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new types_1.AppError("No token provided", 401);
        }
        const token = authHeader.substring(7);
        if (!process.env.JWT_SECRET) {
            throw new types_1.AppError("JWT secret not configured", 500);
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await models_1.User.findById(decoded.id).select("-password");
        if (!user) {
            throw new types_1.AppError("User no longer exists", 401);
        }
        req.user = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new types_1.AppError("Invalid token", 401));
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new types_1.AppError("Token expired", 401));
        }
        next(error);
    }
};
exports.authenticate = authenticate;
const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token ||
            socket.handshake.headers.authorization?.substring(7);
        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }
        if (!process.env.JWT_SECRET) {
            return next(new Error("JWT secret not configured"));
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await models_1.User.findById(decoded.id).select("-password");
        if (!user) {
            return next(new Error("Authentication error: User no longer exists"));
        }
        socket.userId = user._id.toString();
        socket.username = user.username;
        socket.userData = {
            userId: user._id.toString(),
            username: user.username,
            avatar: user.avatar,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new Error("Authentication error: Invalid token"));
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new Error("Authentication error: Token expired"));
        }
        next(new Error("Authentication error"));
    }
};
exports.authenticateSocket = authenticateSocket;
const generateTokens = (user) => {
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
        throw new types_1.AppError("JWT secrets not configured", 500);
    }
    const accessToken = jsonwebtoken_1.default.sign({
        id: user.id,
        username: user.username,
        email: user.email,
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });
    const refreshToken = jsonwebtoken_1.default.sign({
        id: user.id,
        type: "refresh",
    }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const verifyRefreshToken = (token) => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new types_1.AppError("JWT refresh secret not configured", 500);
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
    if (decoded.type !== "refresh") {
        throw new types_1.AppError("Invalid refresh token", 401);
    }
    return { id: decoded.id };
};
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=auth.js.map