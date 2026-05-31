import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import { sendError } from "../utils/apiResponse";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    sendError(res, err.message, err.errors, err.statusCode);
    return;
  }

  logger.error(err.message, { stack: err.stack });
  sendError(res, "Internal server error", [], 500);
};
