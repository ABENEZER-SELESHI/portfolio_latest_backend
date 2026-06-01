import { skillRepository } from "../repositories/skill.repository";
import { sanitizePlainText } from "../utils/sanitize";
export class SkillService {
  list() {
    return skillRepository.findCategoriesWithSkills();
  }

  createCategory(name: string, sortOrder = 0) {
    return skillRepository.createCategory(sanitizePlainText(name), sortOrder);
  }

  updateCategory(id: string, data: { name?: string; sortOrder?: number }) {
    return skillRepository.updateCategory(id, {
      name: data.name ? sanitizePlainText(data.name) : undefined,
      sortOrder: data.sortOrder,
    });
  }

  deleteCategory(id: string) {
    return skillRepository.softDeleteCategory(id);
  }

  createSkill(categoryId: string, name: string, sortOrder = 0) {
    return skillRepository.createSkill(categoryId, sanitizePlainText(name), sortOrder);
  }

  updateSkill(
    id: string,
    data: { name?: string; sortOrder?: number; categoryId?: string }
  ) {
    return skillRepository.updateSkill(id, {
      name: data.name ? sanitizePlainText(data.name) : undefined,
      sortOrder: data.sortOrder,
      categoryId: data.categoryId,
    });
  }

  deleteSkill(id: string) {
    return skillRepository.softDeleteSkill(id);
  }

  reorderCategories(orders: { id: string; sortOrder: number }[]) {
    return skillRepository.reorderCategories(orders);
  }
}

export const skillService = new SkillService();
