import { apiRequest } from "@/services/api";
import type {
  CreateRestaurantInput,
  Restaurant,
  UpdateRestaurantInput
} from "@/types/restaurant";

export const restaurantsService = {
  list() {
    return apiRequest<Restaurant[]>("/restaurants");
  },

  create(input: CreateRestaurantInput) {
    return apiRequest<Restaurant>("/restaurants", {
      body: JSON.stringify(input),
      method: "POST"
    });
  },

  update(restaurantId: string, input: UpdateRestaurantInput) {
    return apiRequest<Restaurant>(`/restaurants/${restaurantId}`, {
      body: JSON.stringify(input),
      method: "PATCH"
    });
  },

  deactivate(restaurantId: string) {
    return apiRequest<Restaurant>(`/restaurants/${restaurantId}/deactivate`, {
      method: "PATCH"
    });
  }
};
