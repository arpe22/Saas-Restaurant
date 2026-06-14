import type { EntityStatus, Timestamped } from "@/types/common";

export type Restaurant = Timestamped & {
  id: string;
  name: string;
  slug: string;
  status: EntityStatus;
};

export type CreateRestaurantInput = {
  name: string;
  slug: string;
  status?: EntityStatus;
};

export type UpdateRestaurantInput = Partial<CreateRestaurantInput>;
