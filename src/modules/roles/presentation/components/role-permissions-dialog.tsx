"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Skeleton } from "@/ui/components/skeleton";
import { cn } from "@/ui/lib/utils";
import {
  usePermissions,
  useRolePermissions,
  useAssignPermissions,
} from "@/modules/roles/presentation/hooks/use-roles";
import type { Role } from "@/modules/roles/domain/entities/role.entity";

interface RolePermissionsDialogProps {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
}

export function RolePermissionsDialog({
  role,
  open,
  onOpenChange,
  readOnly = false,
}: RolePermissionsDialogProps) {
  const t = useTranslations("roles");
  const tCommon = useTranslations("common");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const { data: allPermissions, isLoading: loadingPermissions } =
    usePermissions();
  const { data: rolePermissions, isLoading: loadingRolePerms } =
    useRolePermissions(role?.id ?? "", open && !!role);
  const assignPermissions = useAssignPermissions();

  useEffect(() => {
    if (rolePermissions) {
      setSelectedIds(new Set(rolePermissions.map((permission) => permission.id)));
    }
  }, [rolePermissions]);

  const groupedPermissions = useMemo(() => {
    if (!allPermissions) return {};
    const groups: Record<string, typeof allPermissions> = {};
    for (const permission of allPermissions) {
      if (!groups[permission.module]) {
        groups[permission.module] = [];
      }
      groups[permission.module].push(permission);
    }
    return groups;
  }, [allPermissions]);

  const modules = Object.keys(groupedPermissions).sort();

  const togglePermission = (id: string) => {
    if (readOnly) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleModule = (module: string) => {
    if (readOnly) return;
    const modulePerms = groupedPermissions[module] ?? [];
    const allSelected = modulePerms.every((permission) =>
      selectedIds.has(permission.id),
    );
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const permission of modulePerms) {
        if (allSelected) next.delete(permission.id);
        else next.add(permission.id);
      }
      return next;
    });
  };

  const handleCancel = () => {
    if (rolePermissions) {
      setSelectedIds(new Set(rolePermissions.map((permission) => permission.id)));
    }
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (!role || readOnly) return;
    try {
      await assignPermissions.mutateAsync({
        id: role.id,
        data: { permissionIds: Array.from(selectedIds) },
      });
      onOpenChange(false);
    } catch {
      // Error handled by mutation
    }
  };

  if (!open) return null;

  const isLoading = loadingPermissions || loadingRolePerms;
  const moduleLabel = (module: string) =>
    t.has(`permissions.modules.${module.toLowerCase()}`)
      ? t(`permissions.modules.${module.toLowerCase()}`)
      : module;
  const actionLabel = (action: string) =>
    t.has(`permissions.actions.${action}`)
      ? t(`permissions.actions.${action}`)
      : action;
  const roleName = role
    ? t.has(`names.${role.name}`)
      ? t(`names.${role.name}`)
      : role.name
    : "";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1
          data-testid="dialog-title"
          className="text-[26px] font-semibold leading-tight text-foreground"
        >
          {t("permissions.title")}
          {" — "}
          {roleName}
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          {t("permissions.description")}
        </p>
        <p className="max-w-xl text-sm text-muted-foreground">
          {t("permissions.help")}
        </p>
      </div>

      <div className="w-full max-w-[520px] space-y-5 rounded-xl border border-border bg-card p-5">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-8 w-full" />
            ))}
          </div>
        ) : modules.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("permissions.noPermissions")}
          </p>
        ) : (
          modules.map((module) => {
            const permissions = groupedPermissions[module];
            const selectedCount = permissions.filter((permission) =>
              selectedIds.has(permission.id),
            ).length;
            const allSelected = selectedCount === permissions.length;
            const someSelected = selectedCount > 0 && !allSelected;
            return (
              <div key={module} className="space-y-3">
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggleModule(module)}
                  className="flex w-full items-center gap-2 text-left"
                >
                  <span
                    className={cn(
                      "flex size-[18px] shrink-0 items-center justify-center rounded border text-xs leading-none",
                      allSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : someSelected
                          ? "border-primary"
                          : "border-muted-foreground/30",
                    )}
                  >
                    {allSelected ? "✓" : ""}
                  </span>
                  <span className="font-medium text-sm">
                    {moduleLabel(module)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selectedCount}/{permissions.length}
                  </span>
                  {readOnly ? null : (
                    <span className="ml-auto text-xs font-semibold text-primary">
                      {allSelected
                        ? t("permissions.deselectAll")
                        : t("permissions.selectAll")}
                    </span>
                  )}
                </button>
                <div className="space-y-1">
                  {permissions.map((permission) => {
                    const checked = selectedIds.has(permission.id);
                    return (
                      <div key={permission.id} className="border-t">
                        <label
                          className="flex items-center gap-2.5 py-2 text-left text-[15px] text-foreground"
                          onClick={() => togglePermission(permission.id)}
                        ><div
                            className={cn(
                              "flex size-[18px] shrink-0 items-center justify-center rounded border text-xs leading-none",
                              checked
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-card",
                            )}
                          >
                            {checked ? "✓" : ""}
                          </div>
                          <span>{actionLabel(permission.action)}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {selectedIds.size} {t("fields.permissions")}
      </p>

      <div className="flex gap-3">
        {readOnly ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {tCommon("close")}
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={assignPermissions.isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={assignPermissions.isPending || selectedIds.size === 0}
            >
              {assignPermissions.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {assignPermissions.isPending
                ? tCommon("loading")
                : tCommon("save")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
