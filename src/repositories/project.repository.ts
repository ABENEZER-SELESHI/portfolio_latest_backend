import { prisma } from "../database/prisma";
import { Prisma } from "@prisma/client";

export class ProjectRepository {
  findMany(filters: { category?: string; technology?: string; featured?: boolean }) {
    return prisma.project.findMany({
      where: {
        deletedAt: null,
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.featured !== undefined ? { isFeatured: filters.featured } : {}),
        ...(filters.technology
          ? {
              technologies: {
                some: { technology: { contains: filters.technology, mode: "insensitive" } },
              },
            }
          : {}),
      },
      include: { technologies: true },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    });
  }

  findById(id: string) {
    return prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: { technologies: true },
    });
  }

  create(data: Prisma.ProjectCreateInput) {
    return prisma.project.create({ data, include: { technologies: true } });
  }

  update(id: string, data: Prisma.ProjectUpdateInput) {
    return prisma.project.update({
      where: { id },
      data,
      include: { technologies: true },
    });
  }

  softDelete(id: string) {
    return prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  count() {
    return prisma.project.count({ where: { deletedAt: null } });
  }

  setTechnologies(projectId: string, technologies: string[]) {
    return prisma.$transaction([
      prisma.projectTechnology.deleteMany({ where: { projectId } }),
      ...technologies.map((technology) =>
        prisma.projectTechnology.create({ data: { projectId, technology } })
      ),
    ]);
  }

  lastUpdated() {
    return prisma.project.findFirst({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    });
  }
}

export const projectRepository = new ProjectRepository();
