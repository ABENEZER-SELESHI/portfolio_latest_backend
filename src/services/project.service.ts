import { projectRepository } from "../repositories/project.repository";
import { sanitizePlainText, sanitizeRichText } from "../utils/sanitize";
import { NotFoundError } from "../utils/errors";

export class ProjectService {
  async list(filters: { category?: string; technology?: string; featured?: boolean }) {
    return projectRepository.findMany(filters);
  }

  async get(id: string) {
    const project = await projectRepository.findById(id);
    if (!project) throw new NotFoundError("Project not found");
    return project;
  }

  async create(input: {
    title: string;
    description: string;
    technologies: string[];
    liveUrl?: string;
    githubUrl?: string;
    category?: string;
    isFeatured?: boolean;
    completedAt?: string;
    sortOrder?: number;
    screenshotUrl?: string;
  }) {
    const project = await projectRepository.create({
      title: sanitizePlainText(input.title),
      description: sanitizeRichText(input.description),
      liveUrl: input.liveUrl || null,
      githubUrl: input.githubUrl || null,
      category: input.category ? sanitizePlainText(input.category) : null,
      isFeatured: input.isFeatured ?? false,
      completedAt: input.completedAt ? new Date(input.completedAt) : null,
      sortOrder: input.sortOrder ?? 0,
      screenshotUrl: input.screenshotUrl ?? null,
    });
    if (input.technologies.length) {
      await projectRepository.setTechnologies(project.id, input.technologies);
    }
    return projectRepository.findById(project.id);
  }

  async update(
    id: string,
    input: Partial<{
      title: string;
      description: string;
      technologies: string[];
      liveUrl: string;
      githubUrl: string;
      category: string;
      isFeatured: boolean;
      completedAt: string;
      sortOrder: number;
      screenshotUrl: string;
    }>
  ) {
    const existing = await projectRepository.findById(id);
    if (!existing) throw new NotFoundError("Project not found");

    await projectRepository.update(id, {
      title: input.title ? sanitizePlainText(input.title) : undefined,
      description: input.description ? sanitizeRichText(input.description) : undefined,
      liveUrl: input.liveUrl,
      githubUrl: input.githubUrl,
      category: input.category ? sanitizePlainText(input.category) : undefined,
      isFeatured: input.isFeatured,
      completedAt: input.completedAt ? new Date(input.completedAt) : undefined,
      sortOrder: input.sortOrder,
      screenshotUrl: input.screenshotUrl,
    });

    if (input.technologies) {
      await projectRepository.setTechnologies(id, input.technologies);
    }

    return projectRepository.findById(id);
  }

  async remove(id: string) {
    const existing = await projectRepository.findById(id);
    if (!existing) throw new NotFoundError("Project not found");
    return projectRepository.softDelete(id);
  }
}

export const projectService = new ProjectService();
