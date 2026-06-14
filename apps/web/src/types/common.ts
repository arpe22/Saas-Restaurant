export type EntityStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export type Timestamped = {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
