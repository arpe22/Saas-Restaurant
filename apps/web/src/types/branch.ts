import type { EntityStatus, Timestamped } from "@/types/common";

export type Branch = Timestamped & {
  id: string;
  restaurantId: string;
  name: string;
  slug: string;
  status: EntityStatus;
};

export type CreateBranchInput = {
  name: string;
  slug: string;
  status?: EntityStatus;
};

export type UpdateBranchInput = Partial<CreateBranchInput>;
