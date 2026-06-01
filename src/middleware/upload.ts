import fs from "fs";
import path from "path";
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { env } from "../config/env";
import {
  ALLOWED_CERTIFICATE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
} from "../constants";

const uploadRoot = path.resolve(env.UPLOAD_DIR);
const subdirs = ["projects", "profile", "certificates", "resume", "tech-stack"];

subdirs.forEach((dir) => {
  const fullPath = path.join(uploadRoot, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const folder = (_req as Express.Request & { uploadFolder?: string }).uploadFolder ?? "misc";
    const dest = path.join(uploadRoot, folder);
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const maxSize = env.MAX_FILE_SIZE_MB * 1024 * 1024;

const fileFilter =
  (allowed: string[]) =>
  (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  };

export const uploadImage = multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
});

export const uploadPdf = multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter: fileFilter(ALLOWED_DOCUMENT_TYPES),
});

export const uploadCertificate = multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter: fileFilter(ALLOWED_CERTIFICATE_TYPES),
});

export const setUploadFolder = (folder: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    (req as Request & { uploadFolder?: string }).uploadFolder = folder;
    next();
  };
};

export const getPublicUrl = (folder: string, filename: string): string =>
  `${env.STORAGE_PUBLIC_URL}/${folder}/${filename}`;
