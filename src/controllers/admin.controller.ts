import { Request, Response } from "express";
import { siteService } from "../services/site.service";
import { projectService } from "../services/project.service";
import { certificateService } from "../services/certificate.service";
import { skillService } from "../services/skill.service";
import { techStackService } from "../services/techStack.service";
import { contactService } from "../services/contact.service";
import { siteRepository } from "../repositories/site.repository";
import { sendSuccess } from "../utils/apiResponse";
import { getPublicUrl } from "../middleware/upload";
import { CertificateFileType } from "@prisma/client";
import { NotFoundError } from "../utils/errors";

const paramId = (id: string | string[]): string => (Array.isArray(id) ? id[0] : id);

export class AdminController {
  dashboard = async (_req: Request, res: Response) => {
    const data = await siteService.getDashboardStats();
    sendSuccess(res, data);
  };

  updateSite = async (req: Request, res: Response) => {
    const settings = await siteRepository.getSettings();
    if (!settings) throw new NotFoundError("Site settings not found");

    let profileImageUrl: string | undefined;
    if (req.file) {
      profileImageUrl = getPublicUrl("profile", req.file.filename);
    }

    const data = await siteService.updateSite(settings.id, {
      ...req.body,
      profileImageUrl,
    });
    sendSuccess(res, data, "Site updated");
  };

  uploadResume = async (req: Request, res: Response) => {
    const settings = await siteRepository.getSettings();
    if (!settings) throw new NotFoundError("Site settings not found");
    if (!req.file) throw new NotFoundError("Resume file required");

    const resumeUrl = getPublicUrl("resume", req.file.filename);
    const data = await siteService.updateSite(settings.id, {
      resumeUrl,
      resumeFilename: req.file.originalname,
    });
    sendSuccess(res, data, "Resume uploaded");
  };

  deleteResume = async (_req: Request, res: Response) => {
    const settings = await siteRepository.getSettings();
    if (!settings) throw new NotFoundError("Site settings not found");
    const data = await siteService.updateSite(settings.id, {
      resumeUrl: undefined,
      resumeFilename: undefined,
    });
    sendSuccess(res, data, "Resume removed");
  };

  // Projects
  createProject = async (req: Request, res: Response) => {
    let screenshotUrl: string | undefined;
    if (req.file) screenshotUrl = getPublicUrl("projects", req.file.filename);
    const data = await projectService.create({ ...req.body, screenshotUrl });
    sendSuccess(res, data, "Project created", 201);
  };

  updateProject = async (req: Request, res: Response) => {
    let screenshotUrl: string | undefined;
    if (req.file) screenshotUrl = getPublicUrl("projects", req.file.filename);
    const data = await projectService.update(paramId(req.params.id), {
      ...req.body,
      screenshotUrl,
    });
    sendSuccess(res, data, "Project updated");
  };

  deleteProject = async (req: Request, res: Response) => {
    await projectService.remove(paramId(req.params.id));
    sendSuccess(res, null, "Project deleted");
  };

  // Certificates
  createCertificate = async (req: Request, res: Response) => {
    let fileUrl: string | undefined;
    let fileType: CertificateFileType | undefined;
    if (req.file) {
      fileUrl = getPublicUrl("certificates", req.file.filename);
      fileType = req.file.mimetype === "application/pdf" ? "pdf" : "image";
    }
    const data = await certificateService.create({ ...req.body, fileUrl, fileType });
    sendSuccess(res, data, "Certificate created", 201);
  };

  updateCertificate = async (req: Request, res: Response) => {
    let fileUrl: string | undefined;
    let fileType: CertificateFileType | undefined;
    if (req.file) {
      fileUrl = getPublicUrl("certificates", req.file.filename);
      fileType = req.file.mimetype === "application/pdf" ? "pdf" : "image";
    }
    const data = await certificateService.update(paramId(req.params.id), {
      ...req.body,
      fileUrl,
      fileType,
    });
    sendSuccess(res, data, "Certificate updated");
  };

  deleteCertificate = async (req: Request, res: Response) => {
    await certificateService.remove(paramId(req.params.id));
    sendSuccess(res, null, "Certificate deleted");
  };

  // Skills
  listSkills = async (_req: Request, res: Response) => {
    sendSuccess(res, await skillService.list());
  };

  createCategory = async (req: Request, res: Response) => {
    sendSuccess(res, await skillService.createCategory(req.body.name, req.body.sortOrder), "", 201);
  };

  updateCategory = async (req: Request, res: Response) => {
    sendSuccess(res, await skillService.updateCategory(paramId(req.params.id), req.body));
  };

  deleteCategory = async (req: Request, res: Response) => {
    await skillService.deleteCategory(paramId(req.params.id));
    sendSuccess(res, null, "Category deleted");
  };

  createSkill = async (req: Request, res: Response) => {
    sendSuccess(
      res,
      await skillService.createSkill(req.body.categoryId, req.body.name, req.body.sortOrder),
      "",
      201
    );
  };

  updateSkill = async (req: Request, res: Response) => {
    sendSuccess(res, await skillService.updateSkill(paramId(req.params.id), req.body));
  };

  deleteSkill = async (req: Request, res: Response) => {
    await skillService.deleteSkill(paramId(req.params.id));
    sendSuccess(res, null, "Skill deleted");
  };

  reorderCategories = async (req: Request, res: Response) => {
    await skillService.reorderCategories(req.body.orders);
    sendSuccess(res, null, "Categories reordered");
  };

  // Tech stack
  createTech = async (req: Request, res: Response) => {
    let logoUrl: string | undefined;
    if (req.file) logoUrl = getPublicUrl("tech-stack", req.file.filename);
    sendSuccess(res, await techStackService.create({ ...req.body, logoUrl }), "", 201);
  };

  updateTech = async (req: Request, res: Response) => {
    let logoUrl: string | undefined;
    if (req.file) logoUrl = getPublicUrl("tech-stack", req.file.filename);
    sendSuccess(res, await techStackService.update(paramId(req.params.id), { ...req.body, logoUrl }));
  };

  deleteTech = async (req: Request, res: Response) => {
    await techStackService.remove(paramId(req.params.id));
    sendSuccess(res, null, "Tech stack item deleted");
  };

  // Contact messages
  listMessages = async (_req: Request, res: Response) => {
    sendSuccess(res, await contactService.list());
  };

  markMessageRead = async (req: Request, res: Response) => {
    sendSuccess(res, await contactService.markRead(paramId(req.params.id)));
  };

  deleteMessage = async (req: Request, res: Response) => {
    await contactService.remove(paramId(req.params.id));
    sendSuccess(res, null, "Message deleted");
  };
}

export const adminController = new AdminController();
