"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RefreshCw, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Badge } from "@/ui/components/badge";
import { Skeleton } from "@/ui/components/skeleton";
import { TablePagination } from "@/ui/components/table-pagination";
import {
  Dialog,
  DialogContent,
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  const formatDateLong = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "full",
      timeStyle: "medium",
    }).format(date);
  };

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
                    {formatDate(log.processedAt)}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("detail.title")}</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("detail.externalOrderId")}
                </dt>
                <dd className="mt-1 font-mono text-sm">
                  {selectedLog.externalOrderId}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("detail.action")}
                </dt>
                <dd className="mt-1">
                  <Badge
                    variant={
                      actionVariantMap[selectedLog.action] ?? "secondary"
                    }
                  >
                    {t(`actions.${selectedLog.action}` as never)}
                  </Badge>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("detail.processedAt")}
                </dt>
                <dd className="mt-1 text-sm">
                  {formatDateLong(selectedLog.processedAt)}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("detail.sale")}
                </dt>
                <dd className="mt-1 text-sm">
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
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("detail.contact")}
                </dt>
                <dd className="mt-1 text-sm">
                  {selectedLog.contactId ? (
                    <span className="font-mono">{selectedLog.contactId}</span>
                  ) : (
                    <span className="text-muted-foreground">
                      {t("detail.noContact")}
                    </span>
                  )}
                </dd>
              </div>

              {selectedLog.isFailed && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    {t("detail.errorMessage")}
                  </dt>
                  <dd className="mt-1 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {selectedLog.errorMessage || t("detail.noError")}
                  </dd>
                </div>
              )}

              {selectedLog.isFailed && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
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
                </div>
              )}
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
