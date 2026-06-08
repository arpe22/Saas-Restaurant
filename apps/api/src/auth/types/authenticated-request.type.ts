import type { AuthenticatedUser } from "./auth.types";

export type AuthenticatedRequest = {
  headers: {
    authorization?: string;
  };
  user?: AuthenticatedUser;
};
