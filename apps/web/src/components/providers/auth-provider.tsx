"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { ApiError, clearStoredToken, getStoredToken, setStoredToken } from "@/services/api";
import { authService } from "@/services/auth.service";
import type { AuthenticatedUser } from "@/types/auth";

type AuthContextValue = {
  user: AuthenticatedUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    setToken(getStoredToken());
    setBootstrapped(true);
  }, []);

  const meQuery = useQuery({
    enabled: Boolean(token),
    queryFn: authService.me,
    queryKey: ["auth", "me"]
  });

  useEffect(() => {
    if (meQuery.error instanceof ApiError && meQuery.error.status === 401) {
      clearStoredToken();
      setToken(null);
      queryClient.clear();
    }
  }, [meQuery.error, queryClient]);

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      const response = await authService.login(input);
      setStoredToken(response.accessToken);
      setToken(response.accessToken);
      queryClient.setQueryData(["auth", "me"], response.user);
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  const user = (meQuery.data as AuthenticatedUser | undefined) ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({
      hasAnyPermission: (permissions: string[]) =>
        permissions.some((permission) => user?.permissions.includes(permission)),
      hasPermission: (permission: string) =>
        Boolean(user?.permissions.includes(permission)),
      isAuthenticated: Boolean(token),
      isLoading: !bootstrapped || (Boolean(token) && meQuery.isLoading),
      login,
      logout,
      token,
      user
    }),
    [bootstrapped, login, logout, meQuery.isLoading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
