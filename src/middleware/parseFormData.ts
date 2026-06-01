import { NextFunction, Request, Response } from "express";

/** Coerce multipart string fields to typed values for Zod validation */
export const parseMultipartBody = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.body || typeof req.body !== "object") {
    next();
    return;
  }

  const body = req.body as Record<string, unknown>;

  if (typeof body.isFeatured === "string") {
    body.isFeatured = body.isFeatured === "true";
  }

  if (typeof body.sortOrder === "string") {
    body.sortOrder = Number(body.sortOrder);
  }

  if (typeof body.proficiency === "string") {
    body.proficiency = Number(body.proficiency);
  }

  if (typeof body.technologies === "string") {
    const raw = body.technologies;
    try {
      body.technologies = JSON.parse(raw) as string[];
    } catch {
      body.technologies = raw
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);
    }
  }

  next();
};
