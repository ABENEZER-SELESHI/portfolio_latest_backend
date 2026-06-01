import { prisma } from "../database/prisma";

export class SkillRepository {
  findCategoriesWithSkills() {
    return prisma.skillCategory.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: "asc" },
      include: {
        skills: {
          where: { deletedAt: null },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }

  createCategory(name: string, sortOrder: number) {
    return prisma.skillCategory.create({ data: { name, sortOrder } });
  }

  updateCategory(id: string, data: { name?: string; sortOrder?: number }) {
    return prisma.skillCategory.update({ where: { id }, data });
  }

  softDeleteCategory(id: string) {
    return prisma.skillCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  createSkill(categoryId: string, name: string, sortOrder: number) {
    return prisma.skill.create({ data: { categoryId, name, sortOrder } });
  }

  updateSkill(id: string, data: { name?: string; sortOrder?: number; categoryId?: string }) {
    return prisma.skill.update({ where: { id }, data });
  }

  softDeleteSkill(id: string) {
    return prisma.skill.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  reorderCategories(orders: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      orders.map((o) =>
        prisma.skillCategory.update({
          where: { id: o.id },
          data: { sortOrder: o.sortOrder },
        })
      )
    );
  }
}

export const skillRepository = new SkillRepository();
