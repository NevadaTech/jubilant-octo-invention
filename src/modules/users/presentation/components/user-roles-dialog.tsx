"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Shield, X, Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Skeleton } from "@/ui/components/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import { useRoles } from "@/modules/roles/presentation/hooks/use-roles";
import { useAssignRole, useRemoveRole } from "../hooks/use-users";
import type { User } from "../../domain/entities/user.entity";

interface UserRolesDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserRolesDialog({
  user,
  open,
  onOpenChange,
}: UserRolesDialogProps) {
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const [selectKey, setSelectKey] = useState(0);
  const [removingRoleId, setRemovingRoleId] = useState<string | null>(null);

  const { data: allRoles, isLoading: loadingRoles } = useRoles();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  const userRoleNames = user?.roles ?? [];

  const assignedRoles = (allRoles ?? []).filter((r) =>
    userRoleNames.includes(r.name),
  );
  const availableRoles = (allRoles ?? []).filter(
    (r) =>
      !userRoleNames.includes(r.name) &&
      r.isActive &&
      r.name !== "SYSTEM_ADMIN",
  );

  const canRemove = userRoleNames.length > 1;
  const isAdding = assignRole.isPending;
  const isMutating = isAdding || removeRole.isPending;

  const handleAdd = async (roleId: string) => {
    if (!user) return;
    setSelectKey((k) => k + 1);
    try {
      await assignRole.mutateAsync({ userId: user.id, data: { roleId } });
      toast.success(t("roles.assignSuccess"));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("roles.assignError");
      toast.error(message);
    }
  };

  const handleRemove = async (roleId: string) => {
    if (!user || !canRemove) return;
    setRemovingRoleId(roleId);
    try {
      await removeRole.mutateAsync({ userId: user.id, roleId });
      toast.success(t("roles.removeSuccess"));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("roles.removeError");
      toast.error(message);
    } finally {
      setRemovingRoleId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t("roles.title")} — {user?.fullName}
          </DialogTitle>
          <DialogDescription>{t("roles.description")}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Assigned roles */}
          <div>
            <p className="text-sm font-medium mb-2">{t("roles.assigned")}</p>
            {loadingRoles ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : assignedRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">—</p>
            ) : (
              <div className="space-y-1">
                {assignedRoles.map((role) => {
                  const isRemoving = removingRoleId === role.id;
                  return (
                    <div
                      key={role.id}
                      className={`flex items-center justify-between rounded-md border px-3 py-2 transition-opacity ${isRemoving ? "opacity-50" : ""}`}
                    >
                      <span className="text-sm font-medium">{role.name}</span>
                      {canRemove && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={isMutating}
                          title={t("roles.remove")}
                          onClick={() => handleRemove(role.id)}
                        >
                          {isRemoving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {!canRemove && assignedRoles.length === 1 && (
              <p className="text-xs text-muted-foreground mt-1">
                {t("roles.cannotRemoveLast")}
              </p>
            )}
          </div>

          {/* Add role */}
          <div>
            <p className="text-sm font-medium mb-2">{t("roles.add")}</p>
            {loadingRoles ? (
              <Skeleton className="h-10 w-full" />
            ) : availableRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                {t("roles.noRolesAvailable")}
              </p>
            ) : isAdding ? (
              <div className="flex items-center gap-2 h-10 rounded-md border border-input px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("roles.assigning")}
              </div>
            ) : (
              <Select key={selectKey} onValueChange={handleAdd}>
                <SelectTrigger disabled={isMutating}>
                  <SelectValue placeholder={t("roles.selectRole")} />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isMutating}
          >
            {tCommon("close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
