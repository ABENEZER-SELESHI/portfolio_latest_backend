import { techStackRepository } from "../repositories/techStack.repository";
import { sanitizePlainText } from "../utils/sanitize";
import { NotFoundError } from "../utils/errors";

export class TechStackService {
  list() {
    return techStackRepository.findMany();
  }

  create(input: {
    name: string;
    logoUrl?: string;
    proficiency?: number;
    sortOrder?: number;
  }) {
    return techStackRepository.create({
      name: sanitizePlainText(input.name),
      logoUrl: input.logoUrl ?? null,
      proficiency: input.proficiency ?? null,
      sortOrder: input.sortOrder ?? 0,
    });
  }

  async update(
    id: string,
    input: Partial<{ name: string; logoUrl: string; proficiency: number; sortOrder: number }>
  ) {
    const item = await techStackRepository.findById(id);
    if (!item) throw new NotFoundError("Tech stack item not found");
    return techStackRepository.update(id, {
      name: input.name ? sanitizePlainText(input.name) : undefined,
      logoUrl: input.logoUrl,
      proficiency: input.proficiency,
      sortOrder: input.sortOrder,
    });
  }

  async remove(id: string) {
    const item = await techStackRepository.findById(id);
    if (!item) throw new NotFoundError("Tech stack item not found");
    return techStackRepository.softDelete(id);
  }
}

export const techStackService = new TechStackService();
