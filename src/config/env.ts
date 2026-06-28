import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

/** Normalize Brevo-style SMTP_* names to internal env keys */
function normalizeSmtpEnv(source: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const encryption = source.SMTP_ENCRYPTION?.toUpperCase();
  const secureFromEncryption =
    encryption === "SSL" || encryption === "TLS"
      ? "true"
      : encryption === "STARTTLS" || encryption === "NONE"
        ? "false"
        : source.SMTP_SECURE;

  return {
    ...source,
    SMTP_HOST: source.SMTP_HOST ?? source.SMTP_SERVER,
    SMTP_USER: source.SMTP_USER ?? source.SMTP_USERNAME,
    SMTP_PASS: source.SMTP_PASS ?? source.SMTP_PASSWORD,
    SMTP_PORT: source.SMTP_PORT,
    SMTP_SECURE: secureFromEncryption ?? source.SMTP_SECURE,
    SMTP_FROM: source.SMTP_FROM ?? source.CONTACT_RECIPIENT,
  };
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "staging", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(5000),
  API_URL: z.string().url().default("http://localhost:5000"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  /** Comma-separated browser origins allowed to call the API (defaults to FRONTEND_URL) */
  CORS_ALLOWED_ORIGINS: z.string().optional(),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  MAX_LOGIN_ATTEMPTS: z.coerce.number().default(5),
  LOGIN_LOCKOUT_MINUTES: z.coerce.number().default(15),
  UPLOAD_DIR: z.string().default("uploads"),
  MAX_FILE_SIZE_MB: z.coerce.number().default(5),
  STORAGE_PUBLIC_URL: z.string().default("http://localhost:5000/uploads"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  /** Brevo REST API key (xkeysib-…), not the SMTP key (xsmtpsib-…) */
  BREVO_API_KEY: z.string().optional(),
  /** brevo-api (default) or smtp */
  EMAIL_TRANSPORT: z.enum(["brevo-api", "smtp"]).default("brevo-api"),
  CONTACT_RECIPIENT: z.string().email().default("ebenezerseleshi@gmail.com"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  CONTACT_RATE_LIMIT_MAX: z.coerce.number().default(5),
});

const parsed = envSchema.safeParse(normalizeSmtpEnv(process.env));

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

const parseOriginList = (value: string | undefined): string[] =>
  value
    ? value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

export const corsAllowedOrigins = [
  ...new Set(
    parseOriginList(env.CORS_ALLOWED_ORIGINS).length > 0
      ? parseOriginList(env.CORS_ALLOWED_ORIGINS)
      : [env.FRONTEND_URL]
  ),
];

export const isSmtpConfigured = (): boolean =>
  Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

export const isBrevoApiConfigured = (): boolean => Boolean(env.BREVO_API_KEY);

/** True when at least one delivery method (API or SMTP) is configured */
export const isContactEmailConfigured = (): boolean =>
  isBrevoApiConfigured() || isSmtpConfigured();
