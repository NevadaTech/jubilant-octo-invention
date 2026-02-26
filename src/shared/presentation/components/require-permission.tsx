"use client";

import type { ReactNode } from "react";
import { usePermissions } from "@/modules/authentication/presentation/hooks/use-permissions";
import type { Permission } from "@/shared/domain/permissions";
import { AccessDenied } from "./access-denied";

interface RequirePermissionProps {
  /** Required permission(s). */
  permission: Permission | Permission[];
  /** "any" = at least one. "all" = all required. Default: "any" */
  mode?: "any" | "all";
  children: ReactNode;
}

/**
 * Page-level guard. Shows AccessDenied page when user lacks permissions.
 *
 * Usage in page components:
 * ```tsx
 * <RequirePermission permission={PERMISSIONS.USERS_READ}>
 *   <UserList />
 * </RequirePermission>
 * ```
 */
export function RequirePermission({
  permission,
  mode = "any",
  children,
}: RequirePermissionProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissions();

  const permissions = Array.isArray(permission) ? permission : [permission];

  const hasAccess =
    mode === "all"
      ? hasAllPermissions(permissions)
      : permissions.length === 1
        ? hasPermission(permissions[0])
        : hasAnyPermission(permissions);

  if (!hasAccess) return <AccessDenied />;

  return <>{children}</>;
}
