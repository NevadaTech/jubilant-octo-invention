"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowRightLeft,
  MoreHorizontal,
  Play,
  CheckCircle,
  XCircle,
  Ban,
  Eye,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/ui/layout/page-header";
import { Button } from "@/ui/components/button";
import { Card, CardContent } from "@/ui/components/card";
import { Skeleton } from "@/ui/components/skeleton";
import { TablePagination } from "@/ui/components/table-pagination";
import { SortableHeader } from "@/ui/components/sortable-header";
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
import {
  useTransfers,
  useUpdateTransferStatus,
} from "@/modules/inventory/presentation/hooks/use-transfers";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";
import { formatDateTimeMedium } from "@/lib/date";
import { TransferStatusBadge } from "./transfer-status-badge";
import { TransferFiltersComponent } from "./transfer-filters";
import type { TransferFilters } from "@/modules/inventory/application/dto/transfer.dto";
import type { TransferStatus } from "@/modules/inventory/domain/entities/transfer.entity";

export function TransferList() {
  const t = useTranslations("inventory.transfers");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [filters, setFilters] = useState<TransferFilters>({
    page: 1,
    limit: 10,
  });
  const [pendingStatus, setPendingStatus] = useState<{
    id: string;
    status: "REJECTED" | "CANCELED";
  } | null>(null);
  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);
  const filtersWithCompany = useMemo(
    () =>
      selectedCompanyId
        ? { ...filters, companyId: selectedCompanyId }
        : filters,
    [filters, selectedCompanyId],
  );
  const { data, isLoading, isError } = useTransfers(filtersWithCompany);
  const updateStatus = useUpdateTransferStatus();

  const handlePageSizeChange = (size: number) => {
    setFilters((prev) => ({ ...prev, limit: size, page: 1 }));
  };

  const handleSort = (field: string, order: "asc" | "desc" | undefined) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: order ? (field as TransferFilters["sortBy"]) : undefined,
      sortOrder: order,
      page: 1,
    }));
  };

  const handleUpdateStatus = async (id: string, status: TransferStatus) => {
    await updateStatus.mutateAsync({ id, status });
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
      <div className="space-y-4">
        <PageHeader
          title={t("list.title")}
          description={t("description")}
          action={
            <Button asChild>
              <Link href="/dashboard/inventory/transfers/new">
                {t("actions.new")}
              </Link>
            </Button>
          }
        />
        <TransferFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
        />
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                // eslint-disable-next-line @eslint-react/no-array-index-key
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !data?.data.length ? (
            <div className="py-10 text-center">
              <ArrowRightLeft className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t("empty.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("empty.description")}
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/dashboard/inventory/transfers/new">
                  {t("actions.new")}
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="lg:overflow-hidden lg:rounded-xl lg:border lg:border-border lg:bg-card">
                <table className="w-full">
                  <thead className="hidden bg-muted/70 text-left text-xs font-semibold text-muted-foreground lg:table-header-group">
                    <tr className="h-10">
                      <SortableHeader
                        label={t("fields.status")}
                        field="status"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <th className="pb-3 pr-4">{t("fields.items")}</th>
                      <th className="pb-3 pr-4">{t("fields.from")}</th>
                      <th className="pb-3 pr-4">{t("fields.to")}</th>
                      <th className="pb-3 pr-4">{t("fields.totalQuantity")}</th>
                      <SortableHeader
                        label={t("fields.createdAt")}
                        field="createdAt"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <th className="pb-3 text-right">{t("fields.actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="flex flex-col gap-3 lg:table-row-group">
                    {data.data.map((transfer) => (
                      <tr
                        key={transfer.id}
                        className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3.5 lg:table-row lg:rounded-none lg:border-0 lg:border-b lg:bg-transparent lg:p-0"
                      >
                        <td className="py-4 pr-4">
                          <TransferStatusBadge status={transfer.status} />
                        </td>
                        <td className="py-4 pr-4">
                          <div>
                            <p className="font-medium">
                              {t("list.itemsCount", {
                                count: transfer.totalItems,
                              })}
                            </p>
                            {transfer.lines[0] && (
                              <p className="text-sm text-muted-foreground">
                                {transfer.lines[0].productName}
                                {transfer.totalItems > 1 &&
                                  ` +${transfer.totalItems - 1}`}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          {transfer.fromWarehouseName}
                        </td>
                        <td className="py-4 pr-4">
                          {transfer.toWarehouseName}
                        </td>
                        <td className="py-4 pr-4 font-medium">
                          {transfer.totalQuantity}
                        </td>
                        <td className="py-4 pr-4 text-sm text-muted-foreground">
                          {formatDateTimeMedium(transfer.createdAt, locale)}
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button asChild variant="ghost" size="icon">
                              <Link
                                href={`/dashboard/inventory/transfers/${transfer.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {(transfer.isDraft || transfer.isInTransit) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onMouseDown={(e) => e.preventDefault()}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {transfer.canStartTransit && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleUpdateStatus(
                                          transfer.id,
                                          "IN_TRANSIT",
                                        )
                                      }
                                      disabled={updateStatus.isPending}
                                    >
                                      <Play className="mr-2 h-4 w-4" />
                                      {t("actions.startTransit")}
                                    </DropdownMenuItem>
                                  )}
                                  {transfer.canReceive && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleUpdateStatus(
                                          transfer.id,
                                          "RECEIVED",
                                        )
                                      }
                                      disabled={updateStatus.isPending}
                                      className="text-green-600"
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      {t("actions.receive")}
                                    </DropdownMenuItem>
                                  )}
                                  {transfer.canReject && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setPendingStatus({
                                          id: transfer.id,
                                          status: "REJECTED",
                                        })
                                      }
                                      disabled={updateStatus.isPending}
                                      className="text-orange-600"
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      {t("actions.reject")}
                                    </DropdownMenuItem>
                                  )}
                                  {transfer.canCancel && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setPendingStatus({
                                          id: transfer.id,
                                          status: "CANCELED",
                                        })
                                      }
                                      disabled={updateStatus.isPending}
                                      className="text-destructive"
                                    >
                                      <Ban className="mr-2 h-4 w-4" />
                                      {t("actions.cancel")}
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
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
                allLabel={tCommon("pagination.all")}
              />
            </>
          )}
      </div>

      <AlertDialog
        open={pendingStatus !== null}
        onOpenChange={(open) => {
          if (!open) setPendingStatus(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatus?.status === "REJECTED"
                ? t("confirmReject.title")
                : t("confirmCancel.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus?.status === "REJECTED"
                ? t("confirmReject.description")
                : t("confirmCancel.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingStatus) return;
                void handleUpdateStatus(pendingStatus.id, pendingStatus.status);
                setPendingStatus(null);
              }}
            >
              {tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
