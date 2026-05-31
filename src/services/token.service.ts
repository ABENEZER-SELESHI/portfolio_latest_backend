import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthUser } from "../types/express";

export class TokenService {
  generateAccessToken(user: AuthUser): string {
    return jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
    );
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString("hex");
  }

  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  getRefreshExpiry(): Date {
    const days = 7;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
}

export const tokenService = new TokenService();
