"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  Search,
  Users,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Lock,
  Shield,
} from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Skeleton } from "@/ui/components/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu";
import { useUsers, useChangeUserStatus } from "../hooks/use-users";
import { UserStatusBadge } from "./user-status-badge";
import { UserForm } from "./user-form";
import { UserRolesDialog } from "./user-roles-dialog";
import type { UserFilters } from "../../application/dto/user.dto";
import type { User, UserStatus } from "../../domain/entities/user.entity";

export function UserList() {
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const [filters, setFilters] = useState<UserFilters>({ page: 1, limit: 10 });
  const [searchValue, setSearchValue] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rolesDialogUser, setRolesDialogUser] = useState<User | null>(null);

  const { data, isLoading, isError } = useUsers(filters);
  const changeStatus = useChangeUserStatus();

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status === "all" ? undefined : (status as UserStatus),
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
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("actions.new")}
            </Button>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("search.placeholder")}
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="min-w-[150px]">
              <Label className="text-sm">{t("filters.status")}</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("filters.allStatuses")}
                  </SelectItem>
                  <SelectItem value="ACTIVE">{t("status.active")}</SelectItem>
                  <SelectItem value="INACTIVE">
                    {t("status.inactive")}
                  </SelectItem>
                  <SelectItem value="LOCKED">{t("status.locked")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
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
                      <th className="pb-3 pr-4">{t("fields.name")}</th>
                      <th className="pb-3 pr-4">{t("fields.email")}</th>
                      <th className="pb-3 pr-4">{t("fields.username")}</th>
                      <th className="pb-3 pr-4">{t("fields.status")}</th>
                      <th className="pb-3 pr-4">{t("fields.lastLogin")}</th>
                      <th className="pb-3 pr-4">{t("fields.createdAt")}</th>
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
                              <DropdownMenuItem
                                onClick={() => setRolesDialogUser(user)}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                {t("actions.manageRoles")}
                              </DropdownMenuItem>
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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data.pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t("pagination.showing", {
                      from:
                        (data.pagination.page - 1) * data.pagination.limit + 1,
                      to: Math.min(
                        data.pagination.page * data.pagination.limit,
                        data.pagination.total,
                      ),
                      total: data.pagination.total,
                    })}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={data.pagination.page <= 1}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: data.pagination.page - 1,
                        }))
                      }
                    >
                      {tCommon("previous")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        data.pagination.page >= data.pagination.totalPages
                      }
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: data.pagination.page + 1,
                        }))
                      }
                    >
                      {tCommon("next")}
                    </Button>
                  </div>
                </div>
              )}
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
