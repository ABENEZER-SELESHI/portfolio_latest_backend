export const API_VERSION = "v1";
export const API_PREFIX = `/api/${API_VERSION}`;

export const ROLES = {
  ADMIN: "ADMIN",
} as const;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const ALLOWED_DOCUMENT_TYPES = ["application/pdf"];
export const ALLOWED_CERTIFICATE_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
