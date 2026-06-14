import type { Timestamped } from "@/types/common";

export type Permission = Timestamped & {
  id: string;
  key: string;
  name: string;
  description: string | null;
};

export type PermissionCatalogItem = {
  key: string;
  name: string;
  description: string;
};
