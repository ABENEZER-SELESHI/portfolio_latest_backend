import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { sendError } from "../utils/apiResponse";

export const validate =
  (schema: ZodSchema, source: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      sendError(res, "Validation failed", errors, 400);
      return;
    }

    // Express 5: req.query and req.params are read-only
    if (source === "body") {
      req.body = result.data;
    } else {
      req.validated = { ...req.validated, [source]: result.data };
    }
    next();
  };
