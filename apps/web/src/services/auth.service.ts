import { apiRequest } from "@/services/api";
import type { AuthenticatedUser, LoginResponse } from "@/types/auth";

export const authService = {
  login(input: { email: string; password: string }) {
    return apiRequest<LoginResponse>("/auth/login", {
      body: JSON.stringify(input),
      method: "POST",
      skipAuth: true
    });
  },

  me() {
    return apiRequest<AuthenticatedUser>("/auth/me");
  }
};
