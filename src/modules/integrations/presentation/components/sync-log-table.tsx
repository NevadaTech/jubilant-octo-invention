"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Badge } from "@/ui/components/badge";
import { Skeleton } from "@/ui/components/skeleton";
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
import type { SyncAction } from "@/modules/integrations/domain/entities/integration-sync-log.entity";

const actionVariantMap: Record<
  SyncAction,
  "success" | "destructive" | "secondary" | "warning" | "info"
> = {
  CREATED: "success",
  UPDATED: "info",
  SKIPPED: "secondary",
  FAILED: "destructive",
  OUTBOUND_OK: "success",
  OUTBOUND_FAILED: "warning",
};

interface SyncLogTableProps {
  connectionId: string;
}

export function SyncLogTable({ connectionId }: SyncLogTableProps) {
  const locale = useLocale();
  const t = useTranslations("integrations.syncLogs");
  const tCommon = useTranslations("common");
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const retrySyncLog = useRetrySyncLog(connectionId);

  const { data: result, isLoading } = useSyncLogs(connectionId, {
    page,
    limit: 20,
    action: actionFilter === "ALL" ? undefined : (actionFilter as SyncAction),
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  const logs = result?.data ?? [];
  const pagination = result?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t("title")}</h3>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("allActions")}</SelectItem>
            <SelectItem value="CREATED">{t("actions.CREATED")}</SelectItem>
            <SelectItem value="UPDATED">{t("actions.UPDATED")}</SelectItem>
            <SelectItem value="FAILED">{t("actions.FAILED")}</SelectItem>
            <SelectItem value="SKIPPED">{t("actions.SKIPPED")}</SelectItem>
            <SelectItem value="OUTBOUND_OK">
              {t("actions.OUTBOUND_OK")}
            </SelectItem>
            <SelectItem value="OUTBOUND_FAILED">
              {t("actions.OUTBOUND_FAILED")}
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
                <tr key={log.id} className="border-b">
                  <td className="py-2 font-mono text-xs">
                    {log.externalOrderId}
                  </td>
                  <td className="py-2">
                    <Badge variant={actionVariantMap[log.action]}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="py-2">
                    {log.saleId ? (
                      <Link
                        href={`/dashboard/sales/${log.saleId}`}
                        className="text-primary-600 hover:underline"
                      >
                        {log.saleId.slice(0, 8)}...
                      </Link>
                    ) : (
                      "-"
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
                        onClick={() => retrySyncLog.mutate(log.id)}
                        disabled={retrySyncLog.isPending}
                      >
                        {retrySyncLog.isPending ? (
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

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {tCommon("pagination.showing", {
              from: (pagination.page - 1) * pagination.limit + 1,
              to: Math.min(
                pagination.page * pagination.limit,
                pagination.total,
              ),
              total: pagination.total,
            })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => setPage((p) => p - 1)}
            >
              {tCommon("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              {tCommon("next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
