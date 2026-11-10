"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatDateTimeShort } from "@/lib/date";
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
  useCancelSale,
  useConfirmSale,
  useSales,
} from "@/modules/sales/presentation/hooks/use-sales";
import { usePermissions } from "@/modules/authentication/presentation/hooks/use-permissions";
import { PERMISSIONS } from "@/shared/domain/permissions";
import { PermissionGate } from "@/shared/presentation/components/permission-gate";
import { SaleStatusBadge } from "./sale-status-badge";
import { SaleFiltersComponent } from "./sale-filters";
import type { SaleFilters } from "@/modules/sales/application/dto/sale.dto";
import type { Sale } from "@/modules/sales/domain/entities/sale.entity";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";

export function SaleList() {
  const locale = useLocale();
  const t = useTranslations("sales");
  const tCommon = useTranslations("common");
  const [filters, setFilters] = useState<SaleFilters>({
    page: 1,
    limit: 10,
  });
  const [confirmDialog, setConfirmDialog] = useState<Sale | null>(null);
  const [cancelDialog, setCancelDialog] = useState<Sale | null>(null);

  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);
  const filtersWithCompany = useMemo(
    () =>
      selectedCompanyId
        ? { ...filters, companyId: selectedCompanyId }
        : filters,
    [filters, selectedCompanyId],
  );
  const { data, isLoading, isError } = useSales(filtersWithCompany);
  const confirmSale = useConfirmSale();
  const cancelSale = useCancelSale();
  const { hasPermission } = usePermissions();

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "COP",
      minimumFractionDigits: 0,
    }).format(amount);

  const handleConfirm = async () => {
    if (!confirmDialog) return;
    try {
      await confirmSale.mutateAsync(confirmDialog.id);
      setConfirmDialog(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleCancel = async () => {
    if (!cancelDialog) return;
    try {
      await cancelSale.mutateAsync(cancelDialog.id);
      setCancelDialog(null);
    } catch {
      // Error handled by mutation
    }
  };

  const contactLabel = (sale: Sale) =>
    sale.contactName || sale.customerReference || "-";

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
          <PermissionGate permission={PERMISSIONS.SALES_CREATE}>
            <Button asChild className="rounded-lg">
              <Link href="/dashboard/sales/new">{t("actions.new")}</Link>
            </Button>
          </PermissionGate>
        }
      />
      <SaleFiltersComponent filters={filters} onFiltersChange={setFilters} />

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
                    label={t("fields.saleNumber")}
                    field="saleNumber"
                    currentSortBy={filters.sortBy}
                    currentSortOrder={filters.sortOrder}
                    onSort={(field, order) =>
                      setFilters((prev) => ({
                        ...prev,
                        sortBy: order
                          ? (field as SaleFilters["sortBy"])
                          : undefined,
                        sortOrder: order,
                        page: 1,
                      }))
                    }
                    className="px-3"
                  />
                  <SortableHeader
                    label={t("fields.contact")}
                    field="customerReference"
                    currentSortBy={filters.sortBy}
                    currentSortOrder={filters.sortOrder}
                    onSort={(field, order) =>
                      setFilters((prev) => ({
                        ...prev,
                        sortBy: order
                          ? (field as SaleFilters["sortBy"])
                          : undefined,
                        sortOrder: order,
                        page: 1,
                      }))
                    }
                    className="px-3"
                  />
                  <SortableHeader
                    label={t("fields.status")}
                    field="status"
                    currentSortBy={filters.sortBy}
                    currentSortOrder={filters.sortOrder}
                    onSort={(field, order) =>
                      setFilters((prev) => ({
                        ...prev,
                        sortBy: order
                          ? (field as SaleFilters["sortBy"])
                          : undefined,
                        sortOrder: order,
                        page: 1,
                      }))
                    }
                    className="px-3"
                  />
                  <SortableHeader
                    label={t("fields.total")}
                    field="total"
                    currentSortBy={filters.sortBy}
                    currentSortOrder={filters.sortOrder}
                    onSort={(field, order) =>
                      setFilters((prev) => ({
                        ...prev,
                        sortBy: order
                          ? (field as SaleFilters["sortBy"])
                          : undefined,
                        sortOrder: order,
                        page: 1,
                      }))
                    }
                    className="px-3"
                  />
                  <th className="px-3 pb-3 text-right">{tCommon("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((sale) => (
                  <tr key={sale.id} className="border-t border-border">
                    <td className="px-3 py-3">
                      <Link
                        href={`/dashboard/sales/${sale.id}`}
                        className="font-mono text-sm font-semibold hover:underline"
                      >
                        {sale.saleNumber}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTimeShort(sale.createdAt, locale)}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p>{contactLabel(sale)}</p>
                      <p className="text-xs text-muted-foreground">
                        {sale.warehouseName}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <SaleStatusBadge status={sale.status} />
                    </td>
                    <td className="px-3 py-3">
                      <div>{formatCurrency(sale.totalAmount, sale.currency)}</div>
                      <div>{sale.totalItems}</div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <RowMenu
                        sale={sale}
                        canConfirm={
                          sale.canConfirm &&
                          hasPermission(PERMISSIONS.SALES_CONFIRM)
                        }
                        canCancel={
                          sale.canCancel &&
                          hasPermission(PERMISSIONS.SALES_CANCEL)
                        }
                        onConfirm={() => setConfirmDialog(sale)}
                        onCancel={() => setCancelDialog(sale)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 lg:hidden">
            {data.data.map((sale) => (
              <li
                key={sale.id}
                className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3.5"
              >
                <span className="flex items-center justify-between gap-2">
                  <Link
                    href={`/dashboard/sales/${sale.id}`}
                    className="font-mono text-[15px] font-semibold"
                  >
                    {sale.saleNumber}
                  </Link>
                  <span className="flex items-center gap-1">
                    <SaleStatusBadge status={sale.status} />
                    <RowMenu
                      sale={sale}
                      canConfirm={
                        sale.canConfirm &&
                        hasPermission(PERMISSIONS.SALES_CONFIRM)
                      }
                      canCancel={
                        sale.canCancel && hasPermission(PERMISSIONS.SALES_CANCEL)
                      }
                      onConfirm={() => setConfirmDialog(sale)}
                      onCancel={() => setCancelDialog(sale)}
                    />
                  </span>
                </span>
                <Link
                  href={`/dashboard/sales/${sale.id}`}
                  className="text-[13px] text-muted-foreground"
                >
                  {contactLabel(sale)}
                  {" · "}
                  {formatCurrency(sale.totalAmount, sale.currency)}
                </Link>
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
            <AlertDialogTitle>{t("confirmSale.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmSale.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogCancel disabled={confirmSale.isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={confirmSale.isPending}
            >
              {confirmSale.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {confirmSale.isPending ? tCommon("loading") : t("actions.confirm")}
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
            <AlertDialogTitle>{t("cancelSale.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cancelSale.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogCancel disabled={cancelSale.isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelSale.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelSale.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {cancelSale.isPending
                ? tCommon("loading")
                : t("actions.cancelSale")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RowMenu({
  sale,
  canConfirm,
  canCancel,
  onConfirm,
  onCancel,
}: {
  sale: Sale;
  canConfirm: boolean;
  canCancel: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("sales");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("actions.view")}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/sales/${sale.id}`}>
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
            {t("actions.cancel")}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
