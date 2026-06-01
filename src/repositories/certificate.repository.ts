import { prisma } from "../database/prisma";
import { CertificateFileType, Prisma } from "@prisma/client";

export class CertificateRepository {
  findMany() {
    return prisma.certificate.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { issueDate: "desc" }],
    });
  }

  findById(id: string) {
    return prisma.certificate.findFirst({ where: { id, deletedAt: null } });
  }

  create(data: Prisma.CertificateCreateInput) {
    return prisma.certificate.create({ data });
  }

  update(id: string, data: Prisma.CertificateUpdateInput) {
    return prisma.certificate.update({ where: { id }, data });
  }

  softDelete(id: string) {
    return prisma.certificate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  count() {
    return prisma.certificate.count({ where: { deletedAt: null } });
  }
}

export type { CertificateFileType };
export const certificateRepository = new CertificateRepository();
