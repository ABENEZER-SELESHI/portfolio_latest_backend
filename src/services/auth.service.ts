import bcrypt from "bcryptjs";
import { env } from "../config/env";
import { authRepository } from "../repositories/auth.repository";
import { userRepository } from "../repositories/user.repository";
import { tokenService } from "./token.service";
import { AppError, UnauthorizedError } from "../utils/errors";

export class AuthService {
  async login(email: string, password: string, ip: string) {
    const attempt = await authRepository.getLoginAttempt(ip);
    if (attempt?.lockedUntil && attempt.lockedUntil > new Date()) {
      throw new AppError("Too many login attempts. Try again later.", 429);
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      await this.recordFailedAttempt(ip, attempt?.attemptCount ?? 0);
      throw new UnauthorizedError("Invalid credentials");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await this.recordFailedAttempt(ip, attempt?.attemptCount ?? 0);
      throw new UnauthorizedError("Invalid credentials");
    }

    await authRepository.resetLoginAttempt(ip);
    await userRepository.updateLastLogin(user.id);

    const authUser = { id: user.id, email: user.email, role: user.role };
    const accessToken = tokenService.generateAccessToken(authUser);
    const refreshToken = tokenService.generateRefreshToken();
    const tokenHash = tokenService.hashToken(refreshToken);

    await authRepository.createRefreshToken(
      user.id,
      tokenHash,
      tokenService.getRefreshExpiry()
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  private async recordFailedAttempt(ip: string, current: number) {
    const next = current + 1;
    let lockedUntil: Date | null = null;
    if (next >= env.MAX_LOGIN_ATTEMPTS) {
      lockedUntil = new Date(Date.now() + env.LOGIN_LOCKOUT_MINUTES * 60 * 1000);
    }
    await authRepository.upsertLoginAttempt(ip, next, lockedUntil);
  }

  async refresh(refreshToken: string) {
    const tokenHash = tokenService.hashToken(refreshToken);
    const stored = await authRepository.findRefreshToken(tokenHash);
    if (!stored) throw new UnauthorizedError("Invalid refresh token");

    await authRepository.revokeRefreshToken(tokenHash);

    const authUser = {
      id: stored.user.id,
      email: stored.user.email,
      role: stored.user.role,
    };
    const newAccess = tokenService.generateAccessToken(authUser);
    const newRefresh = tokenService.generateRefreshToken();
    const newHash = tokenService.hashToken(newRefresh);

    await authRepository.createRefreshToken(
      stored.user.id,
      newHash,
      tokenService.getRefreshExpiry()
    );

    return { accessToken: newAccess, refreshToken: newRefresh };
  }

  async logout(refreshToken: string) {
    const tokenHash = tokenService.hashToken(refreshToken);
    await authRepository.revokeRefreshToken(tokenHash);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new UnauthorizedError();

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Current password is incorrect");

    const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
    await userRepository.updatePassword(userId, passwordHash);
    await authRepository.revokeAllUserTokens(userId);
  }

  async me(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new UnauthorizedError();
    return { id: user.id, email: user.email, role: user.role, lastLoginAt: user.lastLoginAt };
  }
}

export const authService = new AuthService();
