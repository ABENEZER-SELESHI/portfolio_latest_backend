import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { env } from "./config/env";
import { apiRouter } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { sendError } from "./utils/apiResponse";

export const createApp = () => {
  const app = express();

  app.set("trust proxy", 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(
    "/uploads",
    express.static(path.resolve(env.UPLOAD_DIR), {
      maxAge: "7d",
    })
  );

  app.use(apiRouter);

  app.use((_req, res) => {
    sendError(res, "Route not found", [], 404);
  });

  app.use(errorHandler);

  return app;
};
