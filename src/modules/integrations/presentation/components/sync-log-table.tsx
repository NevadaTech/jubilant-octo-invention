"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatDateTimeShort, formatDateTimeFull } from "@/lib/date";
import { Link } from "@/i18n/navigation";
import { RefreshCw, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Badge } from "@/ui/components/badge";
import { Skeleton } from "@/ui/components/skeleton";
import { TablePagination } from "@/ui/components/table-pagination";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import {
  useSyncLogs,
  useRetrySyncLog,
} from "@/modules/integrations/presentation/hooks/use-integrations";
import type {
  SyncAction,
  IntegrationSyncLog,
  SyncLogOrderItem,
} from "@/modules/integrations/domain/entities/integration-sync-log.entity";

/** saleId is a real CUID only when it doesn't start with a provider prefix */
function isRealSaleId(saleId: string | null): saleId is string {
  if (!saleId) return false;
  return !saleId.startsWith("vtex-") && !saleId.startsWith("meli-");
}

const actionVariantMap: Record<
  SyncAction,
  "success" | "destructive" | "secondary"
> = {
  SYNCED: "success",
  FAILED: "destructive",
  ALREADY_SYNCED: "secondary",
};

const externalStatusVariant: Record<
  string,
  "success" | "info" | "warning" | "destructive" | "secondary"
> = {
  // VTEX
  "payment-approved": "success",
  "ready-for-handling": "info",
  handling: "info",
  invoiced: "secondary",
  "payment-pending": "warning",
  canceled: "destructive",
  // MeLi
  paid: "success",
  confirmed: "info",
  payment_required: "warning",
  partially_paid: "warning",
  cancelled: "destructive",
};

interface SyncLogTableProps {
  connectionId: string;
}

export function SyncLogTable({ connectionId }: SyncLogTableProps) {
  const locale = useLocale();
  const t = useTranslations("integrations.syncLogs");
  const tCommon = useTranslations("common");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [selectedLog, setSelectedLog] = useState<IntegrationSyncLog | null>(
    null,
  );

  const handleFilterChange = (value: string) => {
    setActionFilter(value);
    setPage(1);
  };
  const retrySyncLog = useRetrySyncLog(connectionId);
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null);

  const handleRetry = (logId: string) => {
    setRetryingLogId(logId);
    retrySyncLog.mutate(logId, {
      onSettled: () => setRetryingLogId(null),
    });
  };

  const {
    data: result,
    isLoading,
    isFetching,
    isError,
  } = useSyncLogs(connectionId, {
    page,
    limit,
    action: actionFilter === "ALL" ? undefined : (actionFilter as SyncAction),
  });

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t("title")}</h3>
        </div>
        <p className="py-8 text-center text-sm text-destructive">
          {t("error")}
        </p>
      </div>
    );
  }

  const logs = result?.data ?? [];
  const pagination = result?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          {t("title")}
          {isFetching && !isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </h3>
        <Select value={actionFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue>
              {actionFilter === "ALL"
                ? t("allActions")
                : t(`actions.${actionFilter}` as never)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("allActions")}</SelectItem>
            <SelectItem value="SYNCED">{t("actions.SYNCED")}</SelectItem>
            <SelectItem value="FAILED">{t("actions.FAILED")}</SelectItem>
            <SelectItem value="ALREADY_SYNCED">
              {t("actions.ALREADY_SYNCED")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {logs.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium text-muted-foreground">
                  {t("columns.orderId")}
                </th>
                <th className="pb-2 font-medium text-muted-foreground">
                  {t("columns.action")}
                </th>
                <th className="pb-2 font-medium text-muted-foreground">
                  {t("columns.orderStatus")}
                </th>
                <th className="pb-2 font-medium text-muted-foreground">
                  {t("columns.saleId")}
                </th>
                <th className="pb-2 font-medium text-muted-foreground">
                  {t("columns.error")}
                </th>
                <th className="pb-2 font-medium text-muted-foreground">
                  {t("columns.date")}
                </th>
                <th className="pb-2 font-medium text-muted-foreground">
                  {t("columns.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => setSelectedLog(log)}
                >
                  <td className="py-2 font-mono text-xs">
                    {log.externalOrderId}
                  </td>
                  <td className="py-2">
                    <Badge
                      variant={actionVariantMap[log.action] ?? "secondary"}
                    >
                      {t(`actions.${log.action}` as never)}
                    </Badge>
                  </td>
                  <td className="py-2">
                    {log.externalOrderStatus ? (
                      <Badge
                        variant={
                          externalStatusVariant[log.externalOrderStatus] ??
                          "secondary"
                        }
                      >
                        {t(`orderStatuses.${log.externalOrderStatus}` as never)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-2">
                    {isRealSaleId(log.saleId) ? (
                      <Link
                        href={`/dashboard/sales/${log.saleId}`}
                        className="text-primary-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {log.saleNumber || log.saleId.slice(0, 8)}
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {t("detail.noSale")}
                      </span>
                    )}
                  </td>
                  <td className="py-2 max-w-48 truncate text-xs text-destructive">
                    {log.errorMessage || "-"}
                  </td>
                  <td className="py-2 text-xs">
                    {formatDateTimeShort(log.processedAt, locale)}
                  </td>
                  <td className="py-2">
                    {log.isFailed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRetry(log.id);
                        }}
                        disabled={retryingLogId !== null}
                      >
                        {retryingLogId === log.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && (
        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setLimit(size);
            setPage(1);
          }}
          showingLabel={tCommon("pagination.showing", {
            from: (pagination.page - 1) * pagination.limit + 1,
            to: Math.min(pagination.page * pagination.limit, pagination.total),
            total: pagination.total,
          })}
          perPageLabel={tCommon("pagination.perPage")}
        />
      )}

      {/* Sync Log Detail Dialog */}
      <Dialog
        open={selectedLog !== null}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      >
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-2xl">
          <DialogHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
            <DialogTitle className="flex flex-wrap items-center gap-2">
              {t("detail.title")}
              {selectedLog && (
                <Badge
                  variant={actionVariantMap[selectedLog.action] ?? "secondary"}
                >
                  {t(`actions.${selectedLog.action}` as never)}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6">
                <div className="space-y-5 py-4">
                  {/* Section: Order Info */}
                  <div>
                    <p className="mb-3 border-b pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("detail.sectionOrderInfo")}
                    </p>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                      <dl className="space-y-0.5">
                        <dt className="text-xs font-medium text-muted-foreground">
                          {t("detail.externalOrderId")}
                        </dt>
                        <dd className="break-all font-mono text-sm">
                          {selectedLog.externalOrderId}
                        </dd>
                      </dl>

                      <dl className="space-y-0.5">
                        <dt className="text-xs font-medium text-muted-foreground">
                          {t("detail.orderStatus")}
                        </dt>
                        <dd>
                          {selectedLog.externalOrderStatus ? (
                            <Badge
                              variant={
                                externalStatusVariant[
                                  selectedLog.externalOrderStatus
                                ] ?? "secondary"
                              }
                            >
                              {t(
                                `orderStatuses.${selectedLog.externalOrderStatus}` as never,
                              )}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {t("detail.noOrderStatus")}
                            </span>
                          )}
                        </dd>
                      </dl>

                      <dl className="space-y-0.5">
                        <dt className="text-xs font-medium text-muted-foreground">
                          {t("detail.externalOrderDate")}
                        </dt>
                        <dd className="text-sm">
                          {selectedLog.externalOrderDate ? (
                            formatDateTimeShort(
                              selectedLog.externalOrderDate,
                              locale,
                            )
                          ) : (
                            <span className="text-muted-foreground">
                              {t("detail.noOrderDate")}
                            </span>
                          )}
                        </dd>
                      </dl>

                      <dl className="space-y-0.5">
                        <dt className="text-xs font-medium text-muted-foreground">
                          {t("detail.processedAt")}
                        </dt>
                        <dd className="text-sm">
                          {formatDateTimeFull(selectedLog.processedAt, locale)}
                        </dd>
                      </dl>

                      <dl className="space-y-0.5">
                        <dt className="text-xs font-medium text-muted-foreground">
                          {t("detail.sale")}
                        </dt>
                        <dd className="text-sm">
                          {isRealSaleId(selectedLog.saleId) ? (
                            <Link
                              href={`/dashboard/sales/${selectedLog.saleId}`}
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              <span className="font-mono">
                                {selectedLog.saleNumber || selectedLog.saleId}
                              </span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">
                              {t("detail.noSale")}
                            </span>
                          )}
                        </dd>
                      </dl>

                      <dl className="space-y-0.5">
                        <dt className="text-xs font-medium text-muted-foreground">
                          {t("detail.contact")}
                        </dt>
                        <dd className="text-sm">
                          {selectedLog.contactId ? (
                            <span className="break-all">
                              {selectedLog.contactName ?? selectedLog.contactId}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {t("detail.noContact")}
                            </span>
                          )}
                        </dd>
                      </dl>
                    </div>
                  </div>

                  {/* Section: Order Items */}
                  <div>
                    <p className="mb-3 border-b pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("detail.orderItems")}
                    </p>
                    {(selectedLog.orderItems?.length ?? 0) > 0 ? (
                      <>
                        {/* Desktop table */}
                        <div className="hidden rounded-md border sm:block">
                          <table className="w-full table-fixed text-sm">
                            <thead>
                              <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                                <th className="px-3 py-1.5 font-medium">
                                  {t("detail.orderItems")}
                                </th>
                                <th className="w-16 px-3 py-1.5 text-right font-medium">
                                  {t("detail.itemQty")}
                                </th>
                                <th className="w-24 px-3 py-1.5 text-right font-medium">
                                  {t("detail.itemPrice")}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedLog.orderItems!.map(
                                (item: SyncLogOrderItem, idx: number) => (
                                  <tr
                                    key={idx}
                                    className="border-b last:border-0"
                                  >
                                    <td className="px-3 py-2">
                                      <p
                                        className="truncate font-medium"
                                        title={item.name}
                                      >
                                        {item.name}
                                      </p>
                                      {item.sku && (
                                        <p className="text-xs text-muted-foreground">
                                          {t("detail.itemSku")}: {item.sku}
                                        </p>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums">
                                      {item.quantity}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono tabular-nums">
                                      ${item.price.toFixed(2)}
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="space-y-2 sm:hidden">
                          {selectedLog.orderItems!.map(
                            (item: SyncLogOrderItem, idx: number) => (
                              <div
                                key={idx}
                                className="rounded-md border px-3 py-2"
                              >
                                <p className="text-sm font-medium leading-snug">
                                  {item.name}
                                </p>
                                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                                  <span>
                                    {item.sku && (
                                      <>
                                        {t("detail.itemSku")}: {item.sku}
                                        {" · "}
                                      </>
                                    )}
                                    {t("detail.itemQty")}: {item.quantity}
                                  </span>
                                  <span className="font-mono font-medium text-foreground">
                                    ${item.price.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="py-3 text-center text-sm text-muted-foreground">
                        {t("detail.noItems")}
                      </p>
                    )}
                  </div>

                  {/* Section: Error */}
                  {selectedLog.isFailed && (
                    <div>
                      <p className="mb-3 border-b pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("detail.sectionError")}
                      </p>
                      <div className="break-words rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                        {selectedLog.errorMessage || t("detail.noError")}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sticky footer with retry */}
              {selectedLog.isFailed && (
                <DialogFooter className="gap-2 border-t px-4 py-4 sm:px-6">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      handleRetry(selectedLog.id);
                      setSelectedLog(null);
                    }}
                    disabled={retryingLogId !== null}
                  >
                    {retryingLogId === selectedLog.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    {t("detail.retry")}
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
