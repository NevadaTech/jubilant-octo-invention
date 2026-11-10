"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { Skeleton } from "@/ui/components/skeleton";
import { PageHeader } from "@/ui/layout/page-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/components/alert-dialog";
import {
  useRoles,
  useDeleteRole,
  useUpdateRole,
} from "@/modules/roles/presentation/hooks/use-roles";
import { usePermissions } from "@/modules/authentication/presentation/hooks/use-permissions";
import { PERMISSIONS } from "@/shared/domain/permissions";
import { PermissionGate } from "@/shared/presentation/components/permission-gate";
import { RoleTypeBadge } from "./role-type-badge";
import { RoleForm } from "./role-form";
import { RolePermissionsDialog } from "./role-permissions-dialog";
import type { Role } from "@/modules/roles/domain/entities/role.entity";

export function RoleList() {
  const t = useTranslations("roles");
  const tCommon = useTranslations("common");
  const [searchValue, setSearchValue] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [permissionsTarget, setPermissionsTarget] = useState<Role | null>(null);

  const { data: roles, isLoading, isError } = useRoles();
  const deleteRole = useDeleteRole();
  const updateRole = useUpdateRole();
  const { hasPermission } = usePermissions();

  const roleName = (role: Role) =>
    t.has(`names.${role.name}`) ? t(`names.${role.name}`) : role.name;

  const filteredRoles = roles?.filter((role) => {
    if (!searchValue) return true;
    const search = searchValue.toLowerCase();
    return (
      role.name.toLowerCase().includes(search) ||
      roleName(role).toLowerCase().includes(search) ||
      role.description?.toLowerCase().includes(search)
    );
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRole.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleToggleStatus = async (role: Role) => {
    try {
      await updateRole.mutateAsync({
        id: role.id,
        data: { isActive: !role.isActive },
      });
    } catch {
      // Error handled by mutation
    }
  };

  const canUpdate = hasPermission(PERMISSIONS.ROLES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.ROLES_DELETE);

  const openPermissions = (role: Role) => setPermissionsTarget(role);

  const actions = (role: Role) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={tCommon("actions")}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => openPermissions(role)}>
          {role.isSystem || !canUpdate
            ? t("actions.viewPermissions")
            : t("actions.managePermissions")}
        </DropdownMenuItem>
        {role.canEdit && canUpdate ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleToggleStatus(role)}>
              {role.isActive ? t("status.inactive") : t("status.active")}
            </DropdownMenuItem>
            {role.canDelete && canDelete ? (
              <DropdownMenuItem
                onClick={() => setDeleteTarget(role)}
                className="text-destructive"
              >
                {t("actions.delete")}
              </DropdownMenuItem>
            ) : null}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {permissionsTarget ? (
        <RolePermissionsDialog
          role={permissionsTarget}
          open
          onOpenChange={(open) => {
            if (!open) setPermissionsTarget(null);
          }}
          readOnly={permissionsTarget.isSystem || !canUpdate}
        />
      ) : (
        <div className="space-y-4">
          {isError ? (
            <p className="rounded-xl border border-border bg-card px-4 py-8 text-center text-sm text-destructive">
              {t("error.loading")}
            </p>
          ) : (
          <>
          <PageHeader
            title={t("list.title")}
            action={
              <PermissionGate permission={PERMISSIONS.ROLES_CREATE}>
                <Button type="button" onClick={() => setIsFormOpen(true)}>
                  {t("actions.new")}
                </Button>
              </PermissionGate>
            }
          />
          <div className="w-full max-w-xs space-y-1">
            <Label htmlFor="roles-search">{tCommon("search")}</Label>
            <Input
              id="roles-search"
              placeholder={t("search.placeholder")}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((item) => (
                <Skeleton key={item} className="h-16 w-full" />
              ))}
            </div>
          ) : !filteredRoles?.length ? (
            <div className="rounded-xl border border-border bg-card px-4 py-10 text-center">
              <h2 className="text-lg font-semibold text-foreground">
                {t("empty.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("empty.description")}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-xl border border-border bg-card lg:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="h-[42px] bg-background text-left text-[13px] font-semibold text-muted-foreground">
                      <th className="px-3 font-semibold" scope="col">
                        {t("fields.name")}
                      </th>
                      <th className="px-3 font-semibold" scope="col">
                        {t("fields.description")}
                      </th>
                      <th className="px-3 font-semibold" scope="col">
                        {t("fields.system")}
                      </th>
                      <th className="w-12 px-3" scope="col">
                        <span className="sr-only">{tCommon("actions")}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoles.map((role) => (
                      <tr
                        key={role.id}
                        className="h-[52px] border-t border-border"
                      >
                        <td className="px-3">
                          <button
                            type="button"
                            className="font-semibold text-foreground"
                            onClick={() => openPermissions(role)}
                          >
                            {roleName(role)}
                          </button>
                          <span className="ml-2 text-xs font-semibold text-muted-foreground">
                            {role.isActive
                              ? t("status.active")
                              : t("status.inactive")}
                          </span>
                        </td>
                        <td className="px-3 text-muted-foreground">
                          {role.description || "-"}
                        </td>
                        <td className="px-3">
                          <RoleTypeBadge isSystem={role.isSystem} />
                        </td>
                        <td className="px-3 text-right">{actions(role)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 lg:hidden">
                {filteredRoles.map((role) => (
                  <article
                    key={role.id}
                    className="rounded-xl border border-border bg-card p-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        className="text-left"
                        onClick={() => openPermissions(role)}
                      >
                        <p className="text-[15px] font-semibold text-foreground">
                          {roleName(role)}
                        </p>
                        <p className="mt-0.5 text-[13px] text-muted-foreground">
                          {role.description || "—"}
                        </p>
                      </button>
                      <RoleTypeBadge isSystem={role.isSystem} />
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      {role.isActive ? (
                        <span />
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground">
                          {t("status.inactive")}
                        </span>
                      )}
                      {actions(role)}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
          </>
          )}
        </div>
      )}

      <RoleForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !deleteRole.isPending) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="max-w-[500px] gap-2.5 rounded-2xl p-5 shadow-none sm:rounded-2xl">
          <AlertDialogHeader className="space-y-2 text-left">
            <p className="text-xs font-semibold text-primary">{t("title")}</p>
            <AlertDialogTitle className="text-lg font-semibold text-foreground">
              {t("delete.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteRole.isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteRole.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRole.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {deleteRole.isPending ? tCommon("loading") : tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
