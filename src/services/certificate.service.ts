import { CertificateFileType } from "@prisma/client";
import { certificateRepository } from "../repositories/certificate.repository";
import { sanitizePlainText } from "../utils/sanitize";
import { NotFoundError } from "../utils/errors";

export class CertificateService {
  list() {
    return certificateRepository.findMany();
  }

  get(id: string) {
    return certificateRepository.findById(id).then((c) => {
      if (!c) throw new NotFoundError("Certificate not found");
      return c;
    });
  }

  create(input: {
    name: string;
    issuer: string;
    issueDate: string;
    fileUrl?: string;
    fileType?: CertificateFileType;
    externalUrl?: string;
    sortOrder?: number;
  }) {
    return certificateRepository.create({
      name: sanitizePlainText(input.name),
      issuer: sanitizePlainText(input.issuer),
      issueDate: new Date(input.issueDate),
      fileUrl: input.fileUrl ?? null,
      fileType: input.fileType ?? null,
      externalUrl: input.externalUrl ?? null,
      sortOrder: input.sortOrder ?? 0,
    });
  }

  update(
    id: string,
    input: Partial<{
      name: string;
      issuer: string;
      issueDate: string;
      fileUrl: string;
      fileType: CertificateFileType;
      externalUrl: string;
      sortOrder: number;
    }>
  ) {
    return this.get(id).then(() =>
      certificateRepository.update(id, {
        name: input.name ? sanitizePlainText(input.name) : undefined,
        issuer: input.issuer ? sanitizePlainText(input.issuer) : undefined,
        issueDate: input.issueDate ? new Date(input.issueDate) : undefined,
        fileUrl: input.fileUrl,
        fileType: input.fileType,
        externalUrl: input.externalUrl,
        sortOrder: input.sortOrder,
      })
    );
  }

  remove(id: string) {
    return this.get(id).then(() => certificateRepository.softDelete(id));
  }
}

export const certificateService = new CertificateService();
