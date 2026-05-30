import { Response } from "express";

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors: string[];
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "",
  status = 200
): Response => {
  return res.status(status).json({ success: true, message, data } satisfies ApiSuccess<T>);
};

export const sendError = (
  res: Response,
  message: string,
  errors: string[] = [],
  status = 400
): Response => {
  return res.status(status).json({ success: false, message, errors } satisfies ApiError);
};
