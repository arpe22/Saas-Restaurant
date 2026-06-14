import { apiRequest } from "@/services/api";
import type { Branch, CreateBranchInput, UpdateBranchInput } from "@/types/branch";

function path(restaurantId: string) {
  return `/restaurants/${restaurantId}/branches`;
}

export const branchesService = {
  list(restaurantId: string) {
    return apiRequest<Branch[]>(path(restaurantId));
  },

  create(restaurantId: string, input: CreateBranchInput) {
    return apiRequest<Branch>(path(restaurantId), {
      body: JSON.stringify(input),
      method: "POST"
    });
  },

  update(restaurantId: string, branchId: string, input: UpdateBranchInput) {
    return apiRequest<Branch>(`${path(restaurantId)}/${branchId}`, {
      body: JSON.stringify(input),
      method: "PATCH"
    });
  },

  deactivate(restaurantId: string, branchId: string) {
    return apiRequest<Branch>(`${path(restaurantId)}/${branchId}/deactivate`, {
      method: "PATCH"
    });
  }
};
