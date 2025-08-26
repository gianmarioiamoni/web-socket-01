import * as jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest, AppError } from "../types";
import { User } from "../models";

interface JwtPayload {
  id: string;
  username: string;
  email: string;
  iat: number;
  exp: number;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!process.env.JWT_SECRET) {
      throw new AppError("JWT secret not configured", 500);
    }

    const decoded = (jwt.verify as any)(
      token,
      process.env.JWT_SECRET
    ) as JwtPayload;

    // Verify user still exists
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    // Attach user to request
    req.user = {
      id: (user as any)._id.toString(),
      username: (user as any).username,
      email: (user as any).email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Invalid token", 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Token expired", 401));
    }
    next(error);
  }
};

export const authenticateSocket = async (
  socket: any,
  next: (err?: Error) => void
) => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.substring(7);

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    if (!process.env.JWT_SECRET) {
      return next(new Error("JWT secret not configured"));
    }

    const decoded = (jwt.verify as any)(
      token,
      process.env.JWT_SECRET
    ) as JwtPayload;

    // Verify user still exists
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new Error("Authentication error: User no longer exists"));
    }

    // Attach user data to socket
    socket.userId = (user as any)._id.toString();
    socket.username = (user as any).username;
    socket.userData = {
      userId: (user as any)._id.toString(),
      username: (user as any).username,
      avatar: (user as any).avatar,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new Error("Authentication error: Invalid token"));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new Error("Authentication error: Token expired"));
    }
    next(new Error("Authentication error"));
  }
};

export const generateTokens = (user: {
  id: string;
  username: string;
  email: string;
}) => {
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new AppError("JWT secrets not configured", 500);
  }

  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
  };

  const accessToken = (jwt.sign as any)(
    payload,
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    }
  );

  const refreshPayload = {
    id: user.id,
    type: "refresh",
  };

  const refreshToken = (jwt.sign as any)(
    refreshPayload,
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    }
  );

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token: string): { id: string } => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new AppError("JWT refresh secret not configured", 500);
  }

  const decoded = (jwt.verify as any)(
    token,
    process.env.JWT_REFRESH_SECRET
  ) as any;

  if (decoded.type !== "refresh") {
    throw new AppError("Invalid refresh token", 401);
  }

  return { id: decoded.id };
};
