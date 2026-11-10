"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Skeleton } from "@/ui/components/skeleton";
import { TablePagination } from "@/ui/components/table-pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/ui/components/dialog";
import { PageHeader } from "@/ui/layout/page-header";
import {
  useUsers,
  useChangeUserStatus,
} from "@/modules/users/presentation/hooks/use-users";
import { usePermissions } from "@/modules/authentication/presentation/hooks/use-permissions";
import { PERMISSIONS } from "@/shared/domain/permissions";
import { PermissionGate } from "@/shared/presentation/components/permission-gate";
import { UserStatusBadge } from "./user-status-badge";
import { UserFiltersComponent } from "./user-filters";
import { UserForm } from "./user-form";
import { UserRolesDialog } from "./user-roles-dialog";
import type { UserFilters } from "@/modules/users/application/dto/user.dto";
import type {
  User,
  UserStatus,
} from "@/modules/users/domain/entities/user.entity";

export function UserList() {
  const t = useTranslations("users");
  const tRoles = useTranslations("roles");
  const tCommon = useTranslations("common");
  const [filters, setFilters] = useState<UserFilters>({ page: 1, limit: 10 });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rolesDialogUser, setRolesDialogUser] = useState<User | null>(null);
  const [lockTarget, setLockTarget] = useState<User | null>(null);

  const { data, isLoading, isError } = useUsers(filters);
  const changeStatus = useChangeUserStatus();
  const { hasPermission } = usePermissions();

  const roleLabel = (name: string) =>
    tRoles.has(`names.${name}`) ? tRoles(`names.${name}`) : name;

  const handlePageSizeChange = (size: number) => {
    setFilters((prev) => ({ ...prev, limit: size, page: 1 }));
  };

  const handleSort = (field: string) => {
    setFilters((prev) => {
      const nextOrder =
        prev.sortBy !== field
          ? "asc"
          : prev.sortOrder === "asc"
            ? "desc"
            : undefined;
      return {
        ...prev,
        sortBy: nextOrder ? (field as UserFilters["sortBy"]) : undefined,
        sortOrder: nextOrder,
        page: 1,
      };
    });
  };

  const handleChangeStatus = async (userId: string, status: UserStatus) => {
    try {
      await changeStatus.mutateAsync({ id: userId, data: { status } });
      setLockTarget(null);
    } catch {
      // Error handled by mutation
    }
  };

  const sortMark = (field: string) => {
    if (filters.sortBy !== field) return "";
    return filters.sortOrder === "asc" ? " ↑" : " ↓";
  };

  const actions = (user: User) => {
    const canManageRoles = hasPermission(PERMISSIONS.USERS_MANAGE_ROLES);
    const canUpdate = hasPermission(PERMISSIONS.USERS_UPDATE);
    if (!canManageRoles && !canUpdate) return null;

    return (
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
          {canManageRoles ? (
            <DropdownMenuItem onClick={() => setRolesDialogUser(user)}>
              {t("actions.manageRoles")}
            </DropdownMenuItem>
          ) : null}
          {canUpdate ? (
            <>
              {canManageRoles ? <DropdownMenuSeparator /> : null}
              {!user.isActive ? (
                <DropdownMenuItem
                  onClick={() => handleChangeStatus(user.id, "ACTIVE")}
                >
                  {t("actions.activate")}
                </DropdownMenuItem>
              ) : null}
              {user.isActive ? (
                <DropdownMenuItem
                  onClick={() => handleChangeStatus(user.id, "INACTIVE")}
                >
                  {t("actions.deactivate")}
                </DropdownMenuItem>
              ) : null}
              {!user.isLocked ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setLockTarget(user)}
                    className="text-destructive"
                  >
                    {t("actions.lock")}
                  </DropdownMenuItem>
                </>
              ) : null}
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <>
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
            <PermissionGate permission={PERMISSIONS.USERS_CREATE}>
              <Button type="button" onClick={() => setIsFormOpen(true)}>
                {t("actions.new")}
              </Button>
            </PermissionGate>
          }
        />

        <UserFiltersComponent filters={filters} onFiltersChange={setFilters} />

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-16 w-full" />
            ))}
          </div>
        ) : !data?.data.length ? (
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
                    <th
                      className="px-3 font-semibold"
                      scope="col"
                      data-testid="sortable-firstName"
                    >
                      <button type="button" onClick={() => handleSort("firstName")}>
                        {t("fields.name")}
                        {sortMark("firstName")}
                      </button>
                    </th>
                    <th className="px-3 font-semibold" scope="col">
                      <button type="button" onClick={() => handleSort("email")}>
                        {t("fields.email")}
                        {sortMark("email")}
                      </button>
                    </th>
                    <th className="px-3 font-semibold" scope="col">
                      {t("fields.roles")}
                    </th>
                    <th className="px-3 font-semibold" scope="col">
                      <button type="button" onClick={() => handleSort("status")}>
                        {t("fields.status")}
                        {sortMark("status")}
                      </button>
                    </th>
                    <th className="w-12 px-3" scope="col">
                      <span className="sr-only">{tCommon("actions")}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((user) => (
                    <tr key={user.id} className="h-[52px] border-t border-border">
                      <td className="px-3 font-semibold text-foreground">
                        <div>{user.fullName}</div>
                        <div className="text-xs font-normal text-muted-foreground">
                          {user.username}
                        </div>
                      </td>
                      <td className="px-3 text-foreground">
                        <div>{user.email}</div>
                        <div>
                          {user.lastLoginAt
                            ? user.lastLoginAt.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "-"}
                        </div>
                      </td>
                      <td className="px-3 text-foreground">
                        {user.roles.map(roleLabel).join(", ") || "-"}
                      </td>
                      <td className="px-3">
                        <UserStatusBadge status={user.status} />
                      </td>
                      <td className="px-3 text-right">{actions(user)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 lg:hidden">
              {data.data.map((user) => (
                <article
                  key={user.id}
                  className="rounded-xl border border-border bg-card p-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[15px] font-semibold text-foreground">
                      {user.fullName}
                    </p>
                    <UserStatusBadge status={user.status} />
                  </div>
                  <p className="mt-1.5 text-[13px] text-muted-foreground">
                    {user.roles.map(roleLabel).join(", ") || "—"}
                    {" · "}
                    {user.email}
                  </p>
                  <div className="mt-1 flex justify-end">{actions(user)}</div>
                </article>
              ))}
            </div>

            <TablePagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              total={data.pagination.total}
              limit={data.pagination.limit}
              onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
              onPageSizeChange={handlePageSizeChange}
              showingLabel={tCommon("pagination.showing", {
                from: (data.pagination.page - 1) * data.pagination.limit + 1,
                to: Math.min(
                  data.pagination.page * data.pagination.limit,
                  data.pagination.total,
                ),
                total: data.pagination.total,
              })}
              perPageLabel={tCommon("pagination.perPage")}
              allLabel={tCommon("pagination.all")}
            />
          </>
        )}
        </>
        )}
      </div>

      <UserForm open={isFormOpen} onOpenChange={setIsFormOpen} />
      <UserRolesDialog
        user={
          rolesDialogUser
            ? (data?.data.find((user) => user.id === rolesDialogUser.id) ??
              rolesDialogUser)
            : null
        }
        open={!!rolesDialogUser}
        onOpenChange={(open) => {
          if (!open) setRolesDialogUser(null);
        }}
      />

      <Dialog
        open={!!lockTarget}
        onOpenChange={(open) => {
          if (!open && !changeStatus.isPending) setLockTarget(null);
        }}
      >
        <DialogContent className="max-w-[500px] gap-2.5 rounded-2xl p-5 shadow-none sm:rounded-2xl">
          <p className="text-xs font-semibold text-primary">{t("title")}</p>
          <DialogTitle className="text-lg font-semibold text-foreground">
            {t("actions.lock")}
          </DialogTitle>
          <DialogDescription>
            {lockTarget
              ? t("lock.description", { name: lockTarget.fullName })
              : null}
          </DialogDescription>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              disabled={changeStatus.isPending}
              onClick={() => setLockTarget(null)}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={changeStatus.isPending || !lockTarget}
              onClick={() => {
                if (lockTarget) handleChangeStatus(lockTarget.id, "LOCKED");
              }}
            >
              {changeStatus.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {changeStatus.isPending ? tCommon("loading") : t("actions.lock")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
