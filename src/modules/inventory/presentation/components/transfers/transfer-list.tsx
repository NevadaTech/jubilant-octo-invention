"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  ArrowRightLeft,
  MoreHorizontal,
  Play,
  CheckCircle,
  XCircle,
  Ban,
  Eye,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
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
  useTransfers,
  useUpdateTransferStatus,
} from "@/modules/inventory/presentation/hooks/use-transfers";
import { TransferStatusBadge } from "./transfer-status-badge";
import { TransferFiltersComponent } from "./transfer-filters";
import { TransferForm } from "./transfer-form";
import type { TransferFilters } from "@/modules/inventory/application/dto/transfer.dto";
import type { TransferStatus } from "@/modules/inventory/domain/entities/transfer.entity";

export function TransferList() {
  const t = useTranslations("inventory.transfers");
  const tCommon = useTranslations("common");
  const [filters, setFilters] = useState<TransferFilters>({
    page: 1,
    limit: 10,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data, isLoading, isError } = useTransfers(filters);
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
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
          <TransferFiltersComponent
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
              <ArrowRightLeft className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t("empty.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("empty.description")}
              </p>
              <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("actions.new")}
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm font-medium text-muted-foreground">
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
                  <tbody>
                    {data.data.map((transfer) => (
                      <tr key={transfer.id} className="border-b">
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
                          {formatDate(transfer.createdAt)}
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
                                        handleUpdateStatus(
                                          transfer.id,
                                          "REJECTED",
                                        )
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
                                        handleUpdateStatus(
                                          transfer.id,
                                          "CANCELED",
                                        )
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
              />
            </>
          )}
        </CardContent>
      </Card>

      <TransferForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </>
  );
}
