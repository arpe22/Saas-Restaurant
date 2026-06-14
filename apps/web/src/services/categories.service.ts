import { apiRequest } from "@/services/api";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput
} from "@/types/menu";

export const categoriesService = {
  list() {
    return apiRequest<Category[]>("/menu/categories");
  },

  create(input: CreateCategoryInput) {
    return apiRequest<Category>("/menu/categories", {
      body: JSON.stringify(input),
      method: "POST"
    });
  },

  update(categoryId: string, input: UpdateCategoryInput) {
    return apiRequest<Category>(`/menu/categories/${categoryId}`, {
      body: JSON.stringify(input),
      method: "PATCH"
    });
  },

  deactivate(categoryId: string) {
    return apiRequest<Category>(`/menu/categories/${categoryId}/deactivate`, {
      method: "PATCH"
    });
  }
};
