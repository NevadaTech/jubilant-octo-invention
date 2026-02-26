"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/modules/authentication/presentation/store/auth.store";
import type { Permission } from "@/shared/domain/permissions";

/**
 * Hook for checking user permissions.
 * Uses the permissions array stored in the auth user entity.
 */
export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;
      return user.hasPermission(permission);
    },
    [user],
  );

  const hasAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      if (!user) return false;
      return user.hasAnyPermission(permissions);
    },
    [user],
  );

  const hasAllPermissions = useCallback(
    (permissions: Permission[]): boolean => {
      if (!user) return false;
      return user.hasAllPermissions(permissions);
    },
    [user],
  );

  const hasRole = useCallback(
    (role: string): boolean => {
      if (!user) return false;
      return user.hasRole(role);
    },
    [user],
  );

  return {
    permissions: user?.permissions ?? [],
    roles: user?.roles ?? [],
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isAuthenticated: !!user,
  };
}
