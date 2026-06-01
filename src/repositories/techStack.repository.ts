import { prisma } from "../database/prisma";
import { Prisma } from "@prisma/client";

export class TechStackRepository {
  findMany() {
    return prisma.techStackItem.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: "asc" },
    });
  }

  findById(id: string) {
    return prisma.techStackItem.findFirst({ where: { id, deletedAt: null } });
  }

  create(data: Prisma.TechStackItemCreateInput) {
    return prisma.techStackItem.create({ data });
  }

  update(id: string, data: Prisma.TechStackItemUpdateInput) {
    return prisma.techStackItem.update({ where: { id }, data });
  }

  softDelete(id: string) {
    return prisma.techStackItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const techStackRepository = new TechStackRepository();
