import { apiRequest } from "@/services/api";
import type { CreateRoleInput, Role, UpdateRoleInput } from "@/types/role";

export const rolesService = {
  list() {
    return apiRequest<Role[]>("/roles");
  },

  create(input: CreateRoleInput) {
    return apiRequest<Role>("/roles", {
      body: JSON.stringify(input),
      method: "POST"
    });
  },

  update(roleId: string, input: UpdateRoleInput) {
    return apiRequest<Role>(`/roles/${roleId}`, {
      body: JSON.stringify(input),
      method: "PATCH"
    });
  },

  deactivate(roleId: string) {
    return apiRequest<Role>(`/roles/${roleId}/deactivate`, {
      method: "PATCH"
    });
  },

  assignPermissions(roleId: string, permissionKeys: string[]) {
    return apiRequest<Role>(`/roles/${roleId}/permissions`, {
      body: JSON.stringify({ permissionKeys }),
      method: "POST"
    });
  },

  removePermissions(roleId: string, permissionKeys: string[]) {
    return apiRequest<Role>(`/roles/${roleId}/permissions`, {
      body: JSON.stringify({ permissionKeys }),
      method: "DELETE"
    });
  },

  assignRoleToUser(userId: string, roleId: string) {
    return apiRequest(`/users/${userId}/roles`, {
      body: JSON.stringify({ roleId }),
      method: "POST"
    });
  }
};
