"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  RotateCcw,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Loader2,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Skeleton } from "@/ui/components/skeleton";
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
import { SortableHeader } from "@/ui/components/sortable-header";
import { TablePagination } from "@/ui/components/table-pagination";
import {
  useReturns,
  useConfirmReturn,
  useCancelReturn,
} from "@/modules/returns/presentation/hooks/use-returns";
import { usePermissions } from "@/modules/authentication/presentation/hooks/use-permissions";
import { PERMISSIONS } from "@/shared/domain/permissions";
import { PermissionGate } from "@/shared/presentation/components/permission-gate";
import { ReturnStatusBadge } from "./return-status-badge";
import { ReturnTypeBadge } from "./return-type-badge";
import { ReturnFiltersComponent } from "./return-filters";
import type { ReturnFilters } from "@/modules/returns/application/dto/return.dto";
import type { Return } from "@/modules/returns/domain/entities/return.entity";

export function ReturnList() {
  const t = useTranslations("returns");
  const tCommon = useTranslations("common");
  const [filters, setFilters] = useState<ReturnFilters>({
    page: 1,
    limit: 10,
  });
  const [confirmDialog, setConfirmDialog] = useState<Return | null>(null);
  const [cancelDialog, setCancelDialog] = useState<Return | null>(null);

  const { data, isLoading, isError } = useReturns(filters);
  const confirmReturn = useConfirmReturn();
  const cancelReturn = useCancelReturn();
  const { hasPermission } = usePermissions();

  const handlePageSizeChange = (size: number) => {
    setFilters((prev) => ({ ...prev, limit: size, page: 1 }));
  };

  const handleSort = (field: string, order: "asc" | "desc" | undefined) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: order ? (field as ReturnFilters["sortBy"]) : undefined,
      sortOrder: order,
      page: 1,
    }));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleConfirm = async () => {
    if (!confirmDialog) return;
    try {
      await confirmReturn.mutateAsync(confirmDialog.id);
      setConfirmDialog(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleCancel = async () => {
    if (!cancelDialog) return;
    try {
      await cancelReturn.mutateAsync(cancelDialog.id);
      setCancelDialog(null);
    } catch {
      // Error handled by mutation
    }
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
            <PermissionGate permission={PERMISSIONS.RETURNS_CREATE}>
              <Button asChild>
                <Link href="/dashboard/returns/new">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("actions.new")}
                </Link>
              </Button>
            </PermissionGate>
          </div>
          <ReturnFiltersComponent
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
              <RotateCcw className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t("empty.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("empty.description")}
              </p>
              <PermissionGate permission={PERMISSIONS.RETURNS_CREATE}>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/returns/new">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("actions.new")}
                  </Link>
                </Button>
              </PermissionGate>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                      <SortableHeader
                        label={t("fields.returnNumber")}
                        field="returnNumber"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label={t("fields.type")}
                        field="type"
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
                        label={t("fields.warehouse")}
                        field="warehouseName"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                        className="hidden md:table-cell"
                      />
                      <SortableHeader
                        label={t("fields.items")}
                        field="items"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                        className="hidden lg:table-cell"
                      />
                      <SortableHeader
                        label={t("fields.total")}
                        field="total"
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
                        className="hidden lg:table-cell"
                      />
                      <th className="pb-3 pr-4 text-right">
                        {tCommon("actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((ret) => (
                      <tr key={ret.id} className="border-b">
                        <td className="py-4 pr-4">
                          <Link
                            href={`/dashboard/returns/${ret.id}`}
                            className="font-mono text-sm font-medium hover:underline"
                          >
                            {ret.returnNumber}
                          </Link>
                        </td>
                        <td className="py-4 pr-4">
                          <ReturnTypeBadge type={ret.type} />
                        </td>
                        <td className="py-4 pr-4">
                          <ReturnStatusBadge status={ret.status} />
                        </td>
                        <td className="hidden py-4 pr-4 md:table-cell">
                          {ret.warehouseName}
                        </td>
                        <td className="hidden py-4 pr-4 lg:table-cell">
                          <span className="font-medium">{ret.totalItems}</span>
                        </td>
                        <td className="py-4 pr-4 font-medium">
                          {formatCurrency(ret.totalAmount, ret.currency)}
                        </td>
                        <td className="hidden py-4 pr-4 text-sm text-muted-foreground lg:table-cell">
                          {formatDate(ret.createdAt)}
                        </td>
                        <td className="py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/returns/${ret.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  {t("actions.view")}
                                </Link>
                              </DropdownMenuItem>
                              {ret.canConfirm &&
                                hasPermission(PERMISSIONS.RETURNS_CONFIRM) && (
                                  <DropdownMenuItem
                                    onClick={() => setConfirmDialog(ret)}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {t("actions.confirm")}
                                  </DropdownMenuItem>
                                )}
                              {ret.canCancel &&
                                hasPermission(PERMISSIONS.RETURNS_CANCEL) && (
                                  <DropdownMenuItem
                                    onClick={() => setCancelDialog(ret)}
                                    className="text-destructive"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    {t("actions.cancelReturn")}
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

      {/* Confirm Return Dialog */}
      <AlertDialog
        open={!!confirmDialog}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmReturn.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmReturn.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmReturn.isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={confirmReturn.isPending}
            >
              {confirmReturn.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {confirmReturn.isPending
                ? tCommon("loading")
                : t("actions.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Return Dialog */}
      <AlertDialog
        open={!!cancelDialog}
        onOpenChange={(open) => !open && setCancelDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancelReturn.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cancelReturn.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelReturn.isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelReturn.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelReturn.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {cancelReturn.isPending
                ? tCommon("loading")
                : t("actions.cancelReturn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
