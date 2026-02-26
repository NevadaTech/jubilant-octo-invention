"use client";

import type { ReactNode } from "react";
import { usePermissions } from "@/modules/authentication/presentation/hooks/use-permissions";
import type { Permission } from "@/shared/domain/permissions";

interface PermissionGateProps {
  /** Required permission(s). If array, uses `mode` to determine matching. */
  permission: Permission | Permission[];
  /** "any" = at least one permission required. "all" = all permissions required. Default: "any" */
  mode?: "any" | "all";
  /** Content to render when permission check passes */
  children: ReactNode;
  /** Optional fallback when permission check fails */
  fallback?: ReactNode;
}

/**
 * Conditionally renders children based on user permissions.
 *
 * Usage:
 * ```tsx
 * <PermissionGate permission={PERMISSIONS.USERS_CREATE}>
 *   <Button>Create User</Button>
 * </PermissionGate>
 *
 * <PermissionGate permission={[PERMISSIONS.SALES_CONFIRM, PERMISSIONS.SALES_CANCEL]} mode="any">
 *   <ActionsMenu />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  permission,
  mode = "any",
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissions();

  const permissions = Array.isArray(permission) ? permission : [permission];

  const hasAccess =
    mode === "all"
      ? hasAllPermissions(permissions)
      : permissions.length === 1
        ? hasPermission(permissions[0])
        : hasAnyPermission(permissions);

  if (!hasAccess) return <>{fallback}</>;

  return <>{children}</>;
}
