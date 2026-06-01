import { prisma } from "../database/prisma";
import { Prisma } from "@prisma/client";

export class SiteRepository {
  getSettings() {
    return prisma.siteSettings.findFirst();
  }

  updateSettings(id: string, data: Prisma.SiteSettingsUpdateInput) {
    return prisma.siteSettings.update({ where: { id }, data });
  }
}

export const siteRepository = new SiteRepository();
