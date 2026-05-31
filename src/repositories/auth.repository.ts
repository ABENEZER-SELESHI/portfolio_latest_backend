import { prisma } from "../database/prisma";

export class AuthRepository {
  createRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
  }

  revokeRefreshToken(tokenHash: string) {
    return prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  revokeAllUserTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  getLoginAttempt(ip: string) {
    return prisma.loginAttempt.findUnique({ where: { ipAddress: ip } });
  }

  upsertLoginAttempt(ip: string, attemptCount: number, lockedUntil?: Date | null) {
    return prisma.loginAttempt.upsert({
      where: { ipAddress: ip },
      create: { ipAddress: ip, attemptCount, lockedUntil: lockedUntil ?? null },
      update: { attemptCount, lockedUntil: lockedUntil ?? null, windowStart: new Date() },
    });
  }

  resetLoginAttempt(ip: string) {
    return prisma.loginAttempt.upsert({
      where: { ipAddress: ip },
      create: { ipAddress: ip, attemptCount: 0 },
      update: { attemptCount: 0, lockedUntil: null },
    });
  }
}

export const authRepository = new AuthRepository();
