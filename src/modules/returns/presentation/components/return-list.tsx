"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatDateTimeMedium } from "@/lib/date";
import { CheckCircle, Eye, Loader2, MoreHorizontal, XCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/ui/layout/page-header";
import { Button } from "@/ui/components/button";
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
  useCancelReturn,
  useConfirmReturn,
  useReturns,
} from "@/modules/returns/presentation/hooks/use-returns";
import { usePermissions } from "@/modules/authentication/presentation/hooks/use-permissions";
import { PERMISSIONS } from "@/shared/domain/permissions";
import { PermissionGate } from "@/shared/presentation/components/permission-gate";
import { ReturnStatusBadge } from "./return-status-badge";
import { ReturnTypeBadge } from "./return-type-badge";
import { ReturnFiltersComponent } from "./return-filters";
import type { ReturnFilters } from "@/modules/returns/application/dto/return.dto";
import type { Return } from "@/modules/returns/domain/entities/return.entity";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";

export function ReturnList() {
  const t = useTranslations("returns");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [filters, setFilters] = useState<ReturnFilters>({
    page: 1,
    limit: 10,
  });
  const [confirmDialog, setConfirmDialog] = useState<Return | null>(null);
  const [cancelDialog, setCancelDialog] = useState<Return | null>(null);

  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);
  const filtersWithCompany = useMemo(
    () =>
      selectedCompanyId
        ? { ...filters, companyId: selectedCompanyId }
        : filters,
    [filters, selectedCompanyId],
  );
  const { data, isLoading, isError } = useReturns(filtersWithCompany);
  const confirmReturn = useConfirmReturn();
  const cancelReturn = useCancelReturn();
  const { hasPermission } = usePermissions();

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "COP",
      minimumFractionDigits: 0,
    }).format(amount);

  const sort = (field: string, order: "asc" | "desc" | undefined) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: order ? (field as ReturnFilters["sortBy"]) : undefined,
      sortOrder: order,
      page: 1,
    }));
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

  const reference = (item: Return) =>
    [item.warehouseName, item.saleNumber].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-col gap-4">
      {isError ? (
        <p className="rounded-xl border border-border bg-card px-4 py-10 text-center text-destructive">
          {t("error.loading")}
        </p>
      ) : (
      <>
      <PageHeader
        title={t("list.title")}
        description={t("description")}
        action={
          <PermissionGate permission={PERMISSIONS.RETURNS_CREATE}>
            <Button asChild className="rounded-lg">
              <Link href="/dashboard/returns/new">{t("actions.new")}</Link>
            </Button>
          </PermissionGate>
        }
      />
      <ReturnFiltersComponent filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {["a", "b", "c", "d", "e"].map((id) => (
            <Skeleton key={id} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <div className="rounded-xl border border-border bg-card px-4 py-10 text-center">
          <h2 className="text-lg font-semibold">{t("empty.title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("empty.description")}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted text-xs font-semibold text-muted-foreground">
                  <SortableHeader
                    label={t("fields.returnNumber")}
                    field="returnNumber"
                    currentSortBy={filters.sortBy}
                    currentSortOrder={filters.sortOrder}
                    onSort={sort}
                    className="px-3"
                  />
                  <SortableHeader
                    label={t("fields.warehouse")}
                    field="warehouseName"
                    currentSortBy={filters.sortBy}
                    currentSortOrder={filters.sortOrder}
                    onSort={sort}
                    className="px-3"
                  />
                  <SortableHeader
                    label={t("fields.status")}
                    field="status"
                    currentSortBy={filters.sortBy}
                    currentSortOrder={filters.sortOrder}
                    onSort={sort}
                    className="px-3"
                  />
                  <SortableHeader
                    label={t("fields.total")}
                    field="total"
                    currentSortBy={filters.sortBy}
                    currentSortOrder={filters.sortOrder}
                    onSort={sort}
                    className="px-3"
                  />
                  <th className="px-3 pb-3 text-right">{tCommon("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-3 py-3">
                      <Link
                        href={`/dashboard/returns/${item.id}`}
                        className="font-mono text-sm font-semibold hover:underline"
                      >
                        {item.returnNumber}
                      </Link>
                      <div className="mt-1">
                        <ReturnTypeBadge type={item.type} />
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <p>{item.warehouseName}</p>
                      {item.saleNumber ? (
                        <p className="font-mono text-xs text-muted-foreground">
                          {item.saleNumber}
                        </p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">
                        {formatDateTimeMedium(item.createdAt, locale)}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <ReturnStatusBadge status={item.status} />
                    </td>
                    <td className="px-3 py-3">
                      <div>{formatCurrency(item.totalAmount, item.currency)}</div>
                      <div>{item.totalItems}</div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <RowMenu
                        item={item}
                        canConfirm={
                          item.canConfirm &&
                          hasPermission(PERMISSIONS.RETURNS_CONFIRM)
                        }
                        canCancel={
                          item.canCancel &&
                          hasPermission(PERMISSIONS.RETURNS_CANCEL)
                        }
                        onConfirm={() => setConfirmDialog(item)}
                        onCancel={() => setCancelDialog(item)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 lg:hidden">
            {data.data.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3.5"
              >
                <span className="flex items-start justify-between gap-2">
                  <Link href={`/dashboard/returns/${item.id}`} className="min-w-0">
                    <span className="block text-[15px] font-semibold">
                      <span className="font-mono">{item.returnNumber}</span>
                      {" · "}
                      {item.type === "RETURN_CUSTOMER"
                        ? t("types.customer")
                        : t("types.supplier")}
                    </span>
                    <span className="block text-[13px] text-muted-foreground">
                      {reference(item)}
                    </span>
                  </Link>
                  <RowMenu
                    item={item}
                    canConfirm={
                      item.canConfirm &&
                      hasPermission(PERMISSIONS.RETURNS_CONFIRM)
                    }
                    canCancel={
                      item.canCancel && hasPermission(PERMISSIONS.RETURNS_CANCEL)
                    }
                    onConfirm={() => setConfirmDialog(item)}
                    onCancel={() => setCancelDialog(item)}
                  />
                </span>
                <ReturnStatusBadge status={item.status} />
              </li>
            ))}
          </ul>

          <TablePagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            total={data.pagination.total}
            limit={data.pagination.limit}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            onPageSizeChange={(limit) =>
              setFilters((prev) => ({ ...prev, limit, page: 1 }))
            }
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

      <AlertDialog
        open={!!confirmDialog}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <AlertDialogContent className="rounded-2xl sm:max-w-[500px]">
          <AlertDialogHeader>
            <p className="text-xs font-semibold text-primary">{t("title")}</p>
            <AlertDialogTitle>{t("confirmReturn.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmReturn.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogCancel disabled={confirmReturn.isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={confirmReturn.isPending}
            >
              {confirmReturn.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {confirmReturn.isPending
                ? tCommon("loading")
                : t("actions.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!cancelDialog}
        onOpenChange={(open) => !open && setCancelDialog(null)}
      >
        <AlertDialogContent className="rounded-2xl sm:max-w-[500px]">
          <AlertDialogHeader>
            <p className="text-xs font-semibold text-primary">{t("title")}</p>
            <AlertDialogTitle>{t("cancelReturn.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cancelReturn.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogCancel disabled={cancelReturn.isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelReturn.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelReturn.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {cancelReturn.isPending
                ? tCommon("loading")
                : t("actions.cancelReturn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RowMenu({
  item,
  canConfirm,
  canCancel,
  onConfirm,
  onCancel,
}: {
  item: Return;
  canConfirm: boolean;
  canCancel: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("returns");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("actions.view")}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/returns/${item.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            {t("actions.view")}
          </Link>
        </DropdownMenuItem>
        {canConfirm ? (
          <DropdownMenuItem onClick={onConfirm}>
            <CheckCircle className="mr-2 h-4 w-4" />
            {t("actions.confirm")}
          </DropdownMenuItem>
        ) : null}
        {canCancel ? (
          <DropdownMenuItem onClick={onCancel} className="text-destructive">
            <XCircle className="mr-2 h-4 w-4" />
            {t("actions.cancelReturn")}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
