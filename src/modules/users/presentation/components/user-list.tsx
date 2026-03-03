"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  Users,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Lock,
  Shield,
} from "lucide-react";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Skeleton } from "@/ui/components/skeleton";
import { TablePagination } from "@/ui/components/table-pagination";
import { SortableHeader } from "@/ui/components/sortable-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu";
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
  const tCommon = useTranslations("common");
  const [filters, setFilters] = useState<UserFilters>({ page: 1, limit: 10 });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rolesDialogUser, setRolesDialogUser] = useState<User | null>(null);

  const { data, isLoading, isError } = useUsers(filters);
  const changeStatus = useChangeUserStatus();
  const { hasPermission } = usePermissions();

  const handlePageSizeChange = (size: number) => {
    setFilters((prev) => ({ ...prev, limit: size, page: 1 }));
  };

  const handleSort = (field: string, order: "asc" | "desc" | undefined) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: order ? (field as UserFilters["sortBy"]) : undefined,
      sortOrder: order,
      page: 1,
    }));
  };

  const handleChangeStatus = async (userId: string, status: UserStatus) => {
    try {
      await changeStatus.mutateAsync({ id: userId, data: { status } });
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
            <PermissionGate permission={PERMISSIONS.USERS_CREATE}>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("actions.new")}
              </Button>
            </PermissionGate>
          </div>
          <UserFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                // eslint-disable-next-line @eslint-react/no-array-index-key
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !data?.data.length ? (
            <div className="py-10 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t("empty.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("empty.description")}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                      <SortableHeader
                        label={t("fields.name")}
                        field="firstName"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label={t("fields.email")}
                        field="email"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label={t("fields.username")}
                        field="username"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label={t("fields.status")}
                        field="status"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label={t("fields.lastLogin")}
                        field="lastLoginAt"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label={t("fields.createdAt")}
                        field="createdAt"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <th className="pb-3 pr-4 text-right">
                        {tCommon("actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="py-4 pr-4">
                          <p className="font-medium">{user.fullName}</p>
                        </td>
                        <td className="py-4 pr-4 text-sm">{user.email}</td>
                        <td className="py-4 pr-4 font-mono text-sm">
                          {user.username}
                        </td>
                        <td className="py-4 pr-4">
                          <UserStatusBadge status={user.status} />
                        </td>
                        <td className="py-4 pr-4 text-sm text-muted-foreground">
                          {user.lastLoginAt
                            ? formatDate(user.lastLoginAt)
                            : "-"}
                        </td>
                        <td className="py-4 pr-4 text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {hasPermission(
                                PERMISSIONS.USERS_MANAGE_ROLES,
                              ) && (
                                <DropdownMenuItem
                                  onClick={() => setRolesDialogUser(user)}
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  {t("actions.manageRoles")}
                                </DropdownMenuItem>
                              )}
                              {hasPermission(PERMISSIONS.USERS_UPDATE) && (
                                <>
                                  <DropdownMenuSeparator />
                                  {!user.isActive && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleChangeStatus(user.id, "ACTIVE")
                                      }
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      {t("actions.activate")}
                                    </DropdownMenuItem>
                                  )}
                                  {user.isActive && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleChangeStatus(user.id, "INACTIVE")
                                      }
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      {t("actions.deactivate")}
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  {!user.isLocked && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleChangeStatus(user.id, "LOCKED")
                                      }
                                      className="text-destructive"
                                    >
                                      <Lock className="mr-2 h-4 w-4" />
                                      {t("actions.lock")}
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

              <TablePagination
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                total={data.pagination.total}
                limit={data.pagination.limit}
                onPageChange={(p) =>
                  setFilters((prev) => ({ ...prev, page: p }))
                }
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
              />
            </>
          )}
        </CardContent>
      </Card>

      <UserForm open={isFormOpen} onOpenChange={setIsFormOpen} />
      <UserRolesDialog
        user={
          rolesDialogUser
            ? (data?.data.find((u) => u.id === rolesDialogUser.id) ??
              rolesDialogUser)
            : null
        }
        open={!!rolesDialogUser}
        onOpenChange={(open) => {
          if (!open) setRolesDialogUser(null);
        }}
      />
    </>
  );
}
