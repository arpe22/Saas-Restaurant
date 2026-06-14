import type { Branch } from "@/types/branch";
import type { EntityStatus, Timestamped } from "@/types/common";

export type UserRoleSummary = {
  role: {
    id: string;
    name: string;
    description: string | null;
    status: EntityStatus;
  };
};

export type User = Timestamped & {
  id: string;
  restaurantId: string;
  branchId: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: EntityStatus;
  branch: Pick<Branch, "id" | "name" | "slug" | "status"> | null;
  roles: UserRoleSummary[];
};

export type CreateUserInput = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  branchId?: string;
};

export type UpdateUserInput = {
  email?: string;
  firstName?: string;
  lastName?: string;
  status?: EntityStatus;
};
