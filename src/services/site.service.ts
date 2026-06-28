import { siteRepository } from "../repositories/site.repository";
import { skillRepository } from "../repositories/skill.repository";
import { projectRepository } from "../repositories/project.repository";
import { certificateRepository } from "../repositories/certificate.repository";
import { contactRepository } from "../repositories/contact.repository";
import { prisma } from "../database/prisma";
import { sanitizeRichText, sanitizePlainText } from "../utils/sanitize";
import { NotFoundError } from "../utils/errors";

export class SiteService {
  async getPublicSite() {
    const settings = await siteRepository.getSettings();
    if (!settings) throw new NotFoundError("Site settings not configured");
    return settings;
  }

  async updateSite(
    id: string,
    data: {
      heroName?: string;
      heroTitle?: string;
      heroIntro?: string;
      aboutBio?: string;
      profileImageUrl?: string;
      linkedinUrl?: string;
      githubUrl?: string;
      contactEmail?: string;
      resumeUrl?: string;
      resumeFilename?: string;
    }
  ) {
    const payload = {
      ...data,
      heroName: data.heroName ? sanitizePlainText(data.heroName) : undefined,
      heroTitle: data.heroTitle ? sanitizePlainText(data.heroTitle) : undefined,
      heroIntro: data.heroIntro ? sanitizeRichText(data.heroIntro) : undefined,
      aboutBio: data.aboutBio ? sanitizeRichText(data.aboutBio) : undefined,
    };
    return siteRepository.updateSettings(id, payload);
  }

  async getDashboardStats() {
    const [projects, certificates, skills, unread, projectLast, site] = await Promise.all([
      projectRepository.count(),
      certificateRepository.count(),
      prisma.techStackItem.count({ where: { deletedAt: null } }),
      contactRepository.countUnread(),
      projectRepository.lastUpdated(),
      siteRepository.getSettings(),
    ]);

    const dates = [projectLast?.updatedAt, site?.updatedAt].filter(Boolean) as Date[];
    const lastUpdated = dates.length
      ? new Date(Math.max(...dates.map((d) => d.getTime())))
      : null;

    return {
      totalProjects: projects,
      totalCertificates: certificates,
      totalSkills: skills,
      unreadMessages: unread,
      lastUpdated,
    };
  }

  async getSkills() {
    return skillRepository.findCategoriesWithSkills();
  }
}

export const siteService = new SiteService();
