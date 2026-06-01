import { prisma } from "../database/prisma";

export class ContactRepository {
  create(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    return prisma.contactMessage.create({ data });
  }

  findMany() {
    return prisma.contactMessage.findMany({
      where: { deletedAt: null },
      orderBy: { submittedAt: "desc" },
    });
  }

  findById(id: string) {
    return prisma.contactMessage.findFirst({ where: { id, deletedAt: null } });
  }

  markRead(id: string) {
    return prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
  }

  softDelete(id: string) {
    return prisma.contactMessage.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  countUnread() {
    return prisma.contactMessage.count({
      where: { deletedAt: null, isRead: false },
    });
  }
}

export const contactRepository = new ContactRepository();
