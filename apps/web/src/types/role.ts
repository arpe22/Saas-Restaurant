import type { EntityStatus, Timestamped } from "@/types/common";
import type { Permission } from "@/types/permission";

export type RolePermission = {
  roleId: string;
  permissionId: string;
  createdAt: string;
  permission: Permission;
};

export type Role = Timestamped & {
  id: string;
  restaurantId: string | null;
  name: string;
  description: string | null;
  scope: "SYSTEM" | "RESTAURANT";
  status: EntityStatus;
  permissions?: RolePermission[];
};

export type CreateRoleInput = {
  name: string;
  description?: string;
};

export type UpdateRoleInput = Partial<CreateRoleInput>;
