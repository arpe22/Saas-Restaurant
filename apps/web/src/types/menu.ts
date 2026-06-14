import type { EntityStatus, Timestamped } from "@/types/common";

export type Category = Timestamped & {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  status: EntityStatus;
};

export type Product = Timestamped & {
  id: string;
  restaurantId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
  status: EntityStatus;
  category: Pick<Category, "id" | "name" | "status"> | null;
};

export type CreateCategoryInput = {
  name: string;
  description?: string;
  imageUrl?: string;
  status?: EntityStatus;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export type CreateProductInput = {
  categoryId?: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable?: boolean;
  status?: EntityStatus;
};

export type UpdateProductInput = Omit<Partial<CreateProductInput>, "price">;
