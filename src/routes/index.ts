import { Router } from "express";
import rateLimit from "express-rate-limit";
import { API_PREFIX } from "../constants";
import { env } from "../config/env";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { authenticate, requireAdmin } from "../middleware/auth";
import {
  setUploadFolder,
  uploadCertificate,
  uploadImage,
  uploadPdf,
} from "../middleware/upload";
import { authController } from "../controllers/auth.controller";
import { publicController } from "../controllers/public.controller";
import { adminController } from "../controllers/admin.controller";
import { loginSchema, refreshSchema, changePasswordSchema } from "../validators/auth.validator";
import { contactSchema } from "../validators/contact.validator";
import { projectQuerySchema, projectSchema } from "../validators/project.validator";
import { siteUpdateSchema } from "../validators/site.validator";
import { z } from "zod";
import { parseMultipartBody } from "../middleware/parseFormData";

const router = Router();

const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many login attempts", errors: [] },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: env.CONTACT_RATE_LIMIT_MAX,
  message: { success: false, message: "Too many contact requests", errors: [] },
});

router.use(globalLimiter);

// Public routes
router.get("/health", asyncHandler(publicController.health));
router.get("/site", asyncHandler(publicController.site));
router.get("/skills", asyncHandler(publicController.skills));
router.get("/tech-stack", asyncHandler(publicController.techStack));
router.get("/projects", validate(projectQuerySchema, "query"), asyncHandler(publicController.projects));
router.get("/projects/:id", asyncHandler(publicController.projectById));
router.get("/certificates", asyncHandler(publicController.certificates));
router.get("/resume", asyncHandler(publicController.resume));
router.get("/resume/download", asyncHandler(publicController.downloadResume));
router.post(
  "/contact",
  contactLimiter,
  validate(contactSchema),
  asyncHandler(publicController.contact)
);

// Auth
router.post("/auth/login", loginLimiter, validate(loginSchema), asyncHandler(authController.login));
router.post("/auth/refresh", validate(refreshSchema), asyncHandler(authController.refresh));
router.post("/auth/logout", validate(refreshSchema), asyncHandler(authController.logout));
router.post(
  "/auth/change-password",
  authenticate,
  requireAdmin,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword)
);
router.get("/auth/me", authenticate, requireAdmin, asyncHandler(authController.me));

// Admin
const admin = Router();
admin.use(authenticate, requireAdmin);

admin.get("/dashboard", asyncHandler(adminController.dashboard));
admin.patch(
  "/site",
  setUploadFolder("profile"),
  uploadImage.single("profileImage"),
  validate(siteUpdateSchema),
  asyncHandler(adminController.updateSite)
);
admin.post(
  "/resume",
  setUploadFolder("resume"),
  uploadPdf.single("resume"),
  asyncHandler(adminController.uploadResume)
);
admin.delete("/resume", asyncHandler(adminController.deleteResume));

admin.post(
  "/projects",
  setUploadFolder("projects"),
  uploadImage.single("screenshot"),
  parseMultipartBody,
  validate(projectSchema),
  asyncHandler(adminController.createProject)
);
admin.patch(
  "/projects/:id",
  setUploadFolder("projects"),
  uploadImage.single("screenshot"),
  parseMultipartBody,
  validate(projectSchema.partial()),
  asyncHandler(adminController.updateProject)
);
admin.delete("/projects/:id", asyncHandler(adminController.deleteProject));

admin.post(
  "/certificates",
  setUploadFolder("certificates"),
  uploadCertificate.single("file"),
  validate(
    z.object({
      name: z.string(),
      issuer: z.string(),
      issueDate: z.string(),
      externalUrl: z.string().url().optional(),
      sortOrder: z.coerce.number().optional(),
    })
  ),
  asyncHandler(adminController.createCertificate)
);
admin.patch(
  "/certificates/:id",
  setUploadFolder("certificates"),
  uploadCertificate.single("file"),
  asyncHandler(adminController.updateCertificate)
);
admin.delete("/certificates/:id", asyncHandler(adminController.deleteCertificate));

admin.get("/skills", asyncHandler(adminController.listSkills));
admin.post(
  "/skills/categories",
  validate(z.object({ name: z.string(), sortOrder: z.coerce.number().optional() })),
  asyncHandler(adminController.createCategory)
);
admin.patch("/skills/categories/:id", asyncHandler(adminController.updateCategory));
admin.delete("/skills/categories/:id", asyncHandler(adminController.deleteCategory));
admin.post(
  "/skills/categories/reorder",
  validate(z.object({ orders: z.array(z.object({ id: z.string().uuid(), sortOrder: z.number() })) })),
  asyncHandler(adminController.reorderCategories)
);
admin.post(
  "/skills",
  validate(z.object({ categoryId: z.string().uuid(), name: z.string(), sortOrder: z.coerce.number().optional() })),
  asyncHandler(adminController.createSkill)
);
admin.patch("/skills/:id", asyncHandler(adminController.updateSkill));
admin.delete("/skills/:id", asyncHandler(adminController.deleteSkill));

admin.post(
  "/tech-stack",
  setUploadFolder("tech-stack"),
  uploadImage.single("logo"),
  validate(z.object({ name: z.string(), proficiency: z.coerce.number().optional(), sortOrder: z.coerce.number().optional() })),
  asyncHandler(adminController.createTech)
);
admin.patch(
  "/tech-stack/:id",
  setUploadFolder("tech-stack"),
  uploadImage.single("logo"),
  asyncHandler(adminController.updateTech)
);
admin.delete("/tech-stack/:id", asyncHandler(adminController.deleteTech));

admin.get("/contact-messages", asyncHandler(adminController.listMessages));
admin.patch("/contact-messages/:id/read", asyncHandler(adminController.markMessageRead));
admin.delete("/contact-messages/:id", asyncHandler(adminController.deleteMessage));

router.use("/admin", admin);

export const apiRouter = Router().use(API_PREFIX, router);
