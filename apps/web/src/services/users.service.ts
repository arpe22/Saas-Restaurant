import { apiRequest } from "@/services/api";
import type { CreateUserInput, UpdateUserInput, User } from "@/types/user";

export const usersService = {
  list() {
    return apiRequest<User[]>("/users");
  },

  create(input: CreateUserInput) {
    return apiRequest<User>("/users", {
      body: JSON.stringify(input),
      method: "POST"
    });
  },

  update(userId: string, input: UpdateUserInput) {
    return apiRequest<User>(`/users/${userId}`, {
      body: JSON.stringify(input),
      method: "PATCH"
    });
  },

  deactivate(userId: string) {
    return apiRequest<User>(`/users/${userId}/deactivate`, {
      method: "PATCH"
    });
  },

  block(userId: string) {
    return apiRequest<User>(`/users/${userId}/block`, {
      method: "PATCH"
    });
  },

  assignBranch(userId: string, branchId: string) {
    return apiRequest<User>(`/users/${userId}/branch`, {
      body: JSON.stringify({ branchId }),
      method: "PATCH"
    });
  }
};
