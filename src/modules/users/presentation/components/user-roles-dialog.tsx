"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Skeleton } from "@/ui/components/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import { cn } from "@/ui/lib/utils";
import { useRoles } from "@/modules/roles/presentation/hooks/use-roles";
import {
  useAssignRole,
  useRemoveRole,
} from "@/modules/users/presentation/hooks/use-users";
import type { User } from "@/modules/users/domain/entities/user.entity";

interface UserRolesDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function sameIds(left: Set<string>, right: Set<string>) {
  if (left.size !== right.size) return false;
  for (const id of left) {
    if (!right.has(id)) return false;
  }
  return true;
}

export function UserRolesDialog({
  user,
  open,
  onOpenChange,
}: UserRolesDialogProps) {
  const t = useTranslations("users");
  const tRoles = useTranslations("roles");
  const tCommon = useTranslations("common");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const initializedRef = useRef(false);

  const { data: allRoles, isLoading: loadingRoles } = useRoles();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();
  const isSaving = assignRole.isPending || removeRole.isPending;

  const displayRoleName = (name: string) =>
    tRoles.has(`names.${name}`) ? tRoles(`names.${name}`) : name;

  const assignedIds = useMemo(() => {
    if (!user || !allRoles) return new Set<string>();
    return new Set(
      allRoles.filter((role) => user.roles.includes(role.name)).map((role) => role.id),
    );
  }, [allRoles, user]);

  useEffect(() => {
    if (!open) {
      initializedRef.current = false;
      return;
    }
    if (initializedRef.current || !user || !allRoles) return;
    setSelected(new Set(assignedIds));
    initializedRef.current = true;
  }, [open, user, allRoles, assignedIds]);

  const assignedNames = new Set(user?.roles ?? []);
  const rows = (allRoles ?? []).filter(
    (role) =>
      (role.isActive || assignedNames.has(role.name)) &&
      (role.name !== "SYSTEM_ADMIN" || assignedNames.has(role.name)),
  );
  const hasAssignedRoles = (allRoles ?? []).some((role) =>
    assignedNames.has(role.name),
  );
  const availableRoles = (allRoles ?? []).filter(
    (role) =>
      role.isActive &&
      role.name !== "SYSTEM_ADMIN" &&
      !assignedNames.has(role.name),
  );

  const toggle = (roleId: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(roleId)) {
        if (next.size === 1) return current;
        next.delete(roleId);
      } else {
        next.add(roleId);
      }
      return next;
    });
  };

  const handleClose = () => {
    if (isSaving) return;
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      for (const roleId of selected) {
        if (!assignedIds.has(roleId)) {
          await assignRole.mutateAsync({ userId: user.id, data: { roleId } });
        }
      }
      for (const roleId of assignedIds) {
        if (!selected.has(roleId)) {
          await removeRole.mutateAsync({ userId: user.id, roleId });
        }
      }
      onOpenChange(false);
    } catch {
      // Error toast handled by hook
    }
  };

  const unchanged = sameIds(selected, assignedIds);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="flex max-h-[85vh] max-w-[500px] flex-col gap-2.5 overflow-hidden rounded-2xl p-5 shadow-none sm:rounded-2xl">
        <p className="text-xs font-semibold text-primary">{t("title")}</p>
        <DialogTitle className="text-lg font-semibold text-foreground">
          {t("roles.title")}
          {user ? ` — ${user.fullName}` : ""}
        </DialogTitle>
        <DialogDescription>
          {user ? t("roles.prompt", { name: user.fullName }) : t("roles.description")}
        </DialogDescription>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {loadingRoles ? (
            <div className="space-y-2">
              {[0, 1, 2].map((item) => (
                <Skeleton key={item} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <>
              {hasAssignedRoles ? null : (
                <p className="text-sm text-muted-foreground">{"\u2014"}</p>
              )}
              {rows.map((role) => {
                const checked = selected.has(role.id);
                return (
                  <button
                    key={role.id}
                    type="button"
                    aria-pressed={checked}
                    disabled={isSaving}
                    title={
                      user &&
                      user.roles.length > 1 &&
                      user.roles.includes(role.name)
                        ? t("roles.remove")
                        : undefined
                    }
                    onClick={() => toggle(role.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left",
                      checked ? "bg-accent" : "bg-background",
                    )}
                  >
                    <span
                      className={cn(
                        "w-6 text-xs font-semibold",
                        checked ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {checked ? tCommon("yes") : tCommon("no")}
                    </span>
                    <span className="text-sm text-foreground">
                      {displayRoleName(role.name)}
                    </span>
                  </button>
                );
              })}
              {availableRoles.length > 0 ? (
                <Select
                  onValueChange={(roleId) => {
                    if (!user || !roleId) return;
                    setSelected((current) => {
                      const next = new Set(current);
                      next.add(roleId);
                      return next;
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("roles.add")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {displayRoleName(role.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="py-2 text-sm text-muted-foreground">
                  {t("roles.noRolesAvailable")}
                </p>
              )}
            </>
          )}
          {selected.size === 1 ? (
            <p className="text-xs text-muted-foreground">
              {t("roles.cannotRemoveLast")}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSaving}
          >
            {tCommon("close")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSaving}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || unchanged || selected.size === 0}
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? tCommon("loading") : tCommon("save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
