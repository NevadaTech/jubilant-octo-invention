"use client";

import { useAuthStore } from "@/modules/authentication/presentation/store/auth.store";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  return {
    user,
    isAuthenticated,
    isLoading,
    isHydrated,
    error,
    clearError,
  };
}
