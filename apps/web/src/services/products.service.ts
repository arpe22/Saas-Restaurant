import { apiRequest } from "@/services/api";
import type { CreateProductInput, Product, UpdateProductInput } from "@/types/menu";

export const productsService = {
  list() {
    return apiRequest<Product[]>("/menu/products");
  },

  listByCategory(categoryId: string) {
    return apiRequest<Product[]>(`/menu/categories/${categoryId}/products`);
  },

  create(input: CreateProductInput) {
    return apiRequest<Product>("/menu/products", {
      body: JSON.stringify(input),
      method: "POST"
    });
  },

  update(productId: string, input: UpdateProductInput) {
    return apiRequest<Product>(`/menu/products/${productId}`, {
      body: JSON.stringify(input),
      method: "PATCH"
    });
  },

  changePrice(productId: string, price: number) {
    return apiRequest<Product>(`/menu/products/${productId}/price`, {
      body: JSON.stringify({ price }),
      method: "PATCH"
    });
  },

  activate(productId: string) {
    return apiRequest<Product>(`/menu/products/${productId}/activate`, {
      method: "PATCH"
    });
  },

  deactivate(productId: string) {
    return apiRequest<Product>(`/menu/products/${productId}/deactivate`, {
      method: "PATCH"
    });
  },

  setAvailability(productId: string, isAvailable: boolean) {
    return apiRequest<Product>(`/menu/products/${productId}/availability`, {
      body: JSON.stringify({ isAvailable }),
      method: "PATCH"
    });
  }
};
