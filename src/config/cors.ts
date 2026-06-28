import type { CorsOptions } from "cors";
import { corsAllowedOrigins } from "./env";

const allowedOrigins = new Set(corsAllowedOrigins);

/** Browser CORS — only listed frontend origins may read API responses. */
export const createCorsOptions = (): CorsOptions => ({
  origin(origin, callback) {
    // No Origin: same-origin, server-to-server, curl/Postman (CORS does not apply)
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86_400,
});
