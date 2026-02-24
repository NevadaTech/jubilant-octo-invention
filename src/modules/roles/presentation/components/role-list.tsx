"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  Search,
  Shield,
  MoreHorizontal,
  Trash2,
  Edit2,
  KeyRound,
  Loader2,
} from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Skeleton } from "@/ui/components/skeleton";
import { Badge } from "@/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useRoles, useDeleteRole, useUpdateRole } from "../hooks/use-roles";
import { DropdownMenuSeparator } from "@/ui/components/dropdown-menu";
import { RoleTypeBadge } from "./role-type-badge";
import { RoleForm } from "./role-form";
import { RolePermissionsDialog } from "./role-permissions-dialog";
import type { Role } from "../../domain/entities/role.entity";

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

  const filteredRoles = roles?.filter((role) => {
    if (!searchValue) return true;
    const search = searchValue.toLowerCase();
    return (
      role.name.toLowerCase().includes(search) ||
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
      date,
    );
  };

  if (isError) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-destructive">{t("error.loading")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t("list.title")}</CardTitle>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("actions.new")}
            </Button>
          </div>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("search.placeholder")}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !filteredRoles?.length ? (
            <div className="py-10 text-center">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t("empty.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("empty.description")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                    <th className="pb-3 pr-4">{t("fields.name")}</th>
                    <th className="pb-3 pr-4">{t("fields.description")}</th>
                    <th className="pb-3 pr-4">{t("fields.system")}</th>
                    <th className="pb-3 pr-4">{t("fields.status")}</th>
                    <th className="pb-3 pr-4">{t("fields.createdAt")}</th>
                    <th className="pb-3 pr-4 text-right">
                      {tCommon("actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map((role) => (
                    <tr key={role.id} className="border-b">
                      <td className="py-4 pr-4">
                        <p className="font-mono font-medium">{role.name}</p>
                      </td>
                      <td className="py-4 pr-4 text-sm text-muted-foreground">
                        {role.description || "-"}
                      </td>
                      <td className="py-4 pr-4">
                        <RoleTypeBadge isSystem={role.isSystem} />
                      </td>
                      <td className="py-4 pr-4">
                        <Badge
                          variant={role.isActive ? "success" : "secondary"}
                        >
                          {role.isActive
                            ? t("status.active")
                            : t("status.inactive")}
                        </Badge>
                      </td>
                      <td className="py-4 pr-4 text-sm text-muted-foreground">
                        {formatDate(role.createdAt)}
                      </td>
                      <td className="py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setPermissionsTarget(role)}
                            >
                              <KeyRound className="mr-2 h-4 w-4" />
                              {role.isSystem
                                ? t("actions.viewPermissions")
                                : t("actions.managePermissions")}
                            </DropdownMenuItem>
                            {role.canEdit && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleToggleStatus(role)}
                                >
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  {role.isActive
                                    ? t("status.inactive")
                                    : t("status.active")}
                                </DropdownMenuItem>
                                {role.canDelete && (
                                  <DropdownMenuItem
                                    onClick={() => setDeleteTarget(role)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t("actions.delete")}
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <RoleForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
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
              {deleteRole.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {deleteRole.isPending ? tCommon("loading") : tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RolePermissionsDialog
        role={permissionsTarget}
        open={!!permissionsTarget}
        onOpenChange={(open) => !open && setPermissionsTarget(null)}
        readOnly={permissionsTarget?.isSystem ?? false}
      />
    </>
  );
}
