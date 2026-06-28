import { createApp } from "./app";
import { corsAllowedOrigins, env } from "./config/env";
import { logger } from "./utils/logger";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT} (${env.NODE_ENV})`);
  logger.info(`CORS allowed origins: ${corsAllowedOrigins.join(", ")}`);
});
