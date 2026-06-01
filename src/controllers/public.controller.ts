import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { siteService } from "../services/site.service";
import { projectService } from "../services/project.service";
import { certificateService } from "../services/certificate.service";
import { techStackService } from "../services/techStack.service";
import { contactService } from "../services/contact.service";
import { siteRepository } from "../repositories/site.repository";
import { sendSuccess } from "../utils/apiResponse";
import { NotFoundError } from "../utils/errors";
import { env } from "../config/env";

export class PublicController {
  health = async (_req: Request, res: Response) => {
    sendSuccess(res, { status: "ok", timestamp: new Date().toISOString() });
  };

  site = async (_req: Request, res: Response) => {
    const data = await siteService.getPublicSite();
    sendSuccess(res, data);
  };

  skills = async (_req: Request, res: Response) => {
    const data = await siteService.getSkills();
    sendSuccess(res, data);
  };

  techStack = async (_req: Request, res: Response) => {
    const data = await techStackService.list();
    sendSuccess(res, data);
  };

  projects = async (req: Request, res: Response) => {
    const data = await projectService.list({
      category: req.query.category as string | undefined,
      technology: req.query.technology as string | undefined,
      featured: req.query.featured as boolean | undefined,
    });
    sendSuccess(res, data);
  };

  projectById = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await projectService.get(id);
    sendSuccess(res, data);
  };

  certificates = async (_req: Request, res: Response) => {
    const data = await certificateService.list();
    sendSuccess(res, data);
  };

  resume = async (_req: Request, res: Response) => {
    const settings = await siteRepository.getSettings();
    if (!settings?.resumeUrl) throw new NotFoundError("Resume not available");
    sendSuccess(res, {
      filename: settings.resumeFilename,
      downloadUrl: `${env.API_URL}/api/v1/resume/download`,
    });
  };

  downloadResume = async (_req: Request, res: Response) => {
    const settings = await siteRepository.getSettings();
    if (!settings?.resumeUrl) throw new NotFoundError("Resume not available");

    const filePath = path.join(
      env.UPLOAD_DIR,
      "resume",
      path.basename(settings.resumeUrl)
    );
    if (!fs.existsSync(filePath)) throw new NotFoundError("Resume file missing");

    res.download(filePath, settings.resumeFilename ?? "resume.pdf");
  };

  contact = async (req: Request, res: Response) => {
    const data = await contactService.submit(req.body);
    sendSuccess(res, data, "Message sent successfully", 201);
  };
}

export const publicController = new PublicController();
