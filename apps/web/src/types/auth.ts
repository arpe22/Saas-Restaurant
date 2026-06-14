export type AuthenticatedUser = {
  userId: string;
  restaurantId: string;
  branchId: string | null;
  email: string;
  roles: string[];
  permissions: string[];
};

export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  user: AuthenticatedUser;
};
