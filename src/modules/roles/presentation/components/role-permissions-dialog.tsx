"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Shield, Check } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Skeleton } from "@/ui/components/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/ui/components/dialog";
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: allPermissions, isLoading: loadingPermissions } =
    usePermissions();
  const { data: rolePermissions, isLoading: loadingRolePerms } =
    useRolePermissions(role?.id ?? "", open && !!role);
  const assignPermissions = useAssignPermissions();

  // Initialize selection from role's current permissions
  useEffect(() => {
    if (rolePermissions) {
      setSelectedIds(new Set(rolePermissions.map((p) => p.id)));
    }
  }, [rolePermissions]);

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    if (!allPermissions) return {};
    const groups: Record<string, typeof allPermissions> = {};
    for (const perm of allPermissions) {
      if (!groups[perm.module]) {
        groups[perm.module] = [];
      }
      groups[perm.module].push(perm);
    }
    return groups;
  }, [allPermissions]);

  const modules = Object.keys(groupedPermissions).sort();

  const togglePermission = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleModule = (module: string) => {
    const modulePerms = groupedPermissions[module] ?? [];
    const allSelected = modulePerms.every((p) => selectedIds.has(p.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const perm of modulePerms) {
        if (allSelected) {
          next.delete(perm.id);
        } else {
          next.add(perm.id);
        }
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!role) return;
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

  const isLoading = loadingPermissions || loadingRolePerms;

  const moduleLabel = (module: string): string => {
    const key = module.toLowerCase();
    // Try to get translation, fallback to module name
    try {
      return t(`permissions.modules.${key}`);
    } catch {
      return module;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t("permissions.title")} — {role?.name}
          </DialogTitle>
          <DialogDescription>{t("permissions.description")}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : modules.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {t("permissions.noPermissions")}
            </p>
          ) : (
            modules.map((module) => {
              const perms = groupedPermissions[module];
              const allSelected = perms.every((p) => selectedIds.has(p.id));
              const someSelected = perms.some((p) => selectedIds.has(p.id));

              return (
                <div key={module} className="rounded-lg border">
                  <button
                    type="button"
                    onClick={() => !readOnly && toggleModule(module)}
                    disabled={readOnly}
                    className={`flex w-full items-center justify-between px-4 py-3 transition-colors ${readOnly ? "cursor-default" : "hover:bg-muted/50"}`}
                  >
                    <span className="font-medium text-sm">
                      {moduleLabel(module)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {perms.filter((p) => selectedIds.has(p.id)).length}/
                        {perms.length}
                      </span>
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                          allSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : someSelected
                              ? "bg-primary/30 border-primary"
                              : "border-muted-foreground/30"
                        }`}
                      >
                        {(allSelected || someSelected) && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </button>
                  <div className="border-t px-4 py-2 grid grid-cols-2 gap-1">
                    {perms.map((perm) => (
                      <label
                        key={perm.id}
                        className={`flex items-center gap-2 py-1.5 px-2 rounded text-sm ${readOnly ? "cursor-default" : "hover:bg-muted/50 cursor-pointer"}`}
                      >
                        <div
                          className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            selectedIds.has(perm.id)
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground/30"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            if (!readOnly) togglePermission(perm.id);
                          }}
                        >
                          {selectedIds.has(perm.id) && (
                            <Check className="h-3 w-3" />
                          )}
                        </div>
                        <span
                          className={
                            readOnly ? "cursor-default" : "cursor-pointer"
                          }
                          onClick={() => {
                            if (!readOnly) togglePermission(perm.id);
                          }}
                        >
                          {perm.action}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="pt-4 border-t">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-muted-foreground">
              {selectedIds.size} {t("fields.permissions").toLowerCase()}
            </span>
            <div className="flex gap-2">
              {readOnly ? (
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  {tCommon("close")}
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    {tCommon("cancel")}
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={
                      assignPermissions.isPending || selectedIds.size === 0
                    }
                  >
                    {assignPermissions.isPending
                      ? tCommon("loading")
                      : tCommon("save")}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
