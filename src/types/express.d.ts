import { UserRole } from "@prisma/client";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      validated?: {
        query?: Record<string, unknown>;
        params?: Record<string, unknown>;
        body?: unknown;
      };
    }
  }
}

export {};
