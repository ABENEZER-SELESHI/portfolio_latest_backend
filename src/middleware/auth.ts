import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import { AuthUser } from "../types/express";

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new UnauthorizedError("Access token required"));
    return;
  }

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role as AuthUser["role"],
    };
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired access token"));
  }
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== "ADMIN") {
    next(new ForbiddenError("Admin access required"));
    return;
  }
  next();
};
