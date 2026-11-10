"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatDateTimeShort } from "@/lib/date";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Badge } from "@/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import {
  useSyncLogs,
  useRetrySyncLog,
  useRetryAllFailed,
} from "@/modules/integrations/presentation/hooks/use-integrations";
import { ActionDialog } from "./action-dialog";

interface FailedSyncsTabProps {
  connectionId: string;
}

export function FailedSyncsTab({ connectionId }: FailedSyncsTabProps) {
  const locale = useLocale();
  const t = useTranslations("integrations.failedSyncs");
  const tCommon = useTranslations("common");
  const retrySyncLog = useRetrySyncLog(connectionId);
  const retryAll = useRetryAllFailed(connectionId);
  const [pendingRetry, setPendingRetry] = useState<
    { kind: "one"; id: string; message: string } | { kind: "all" } | null
  >(null);

  const { data: failedResult, isLoading: isLoadingFailed } = useSyncLogs(
    connectionId,
    {
      action: "FAILED",
      limit: 50,
    },
  );

  const { data: partialResult, isLoading: isLoadingPartial } = useSyncLogs(
    connectionId,
    {
      action: "PARTIAL",
      limit: 50,
    },
  );

  const isLoading = isLoadingFailed || isLoadingPartial;
  const failedLogs = [
    ...(failedResult?.data ?? []),
    ...(partialResult?.data ?? []),
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {t("title")}
            {failedLogs.length > 0 && (
              <Badge variant="destructive">{failedLogs.length}</Badge>
            )}
          </CardTitle>
          {failedLogs.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPendingRetry({ kind: "all" })}
              disabled={retryAll.isPending}
            >
              {retryAll.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {t("retryAll")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>
        ) : failedLogs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <div className="space-y-2">
            {failedLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      {log.externalOrderId}
                    </span>
                    {log.externalOrderStatus && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {log.externalOrderStatus}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDateTimeShort(log.processedAt, locale)}
                    </span>
                  </div>
                  {log.errorMessage && (
                    <p className="mt-1 text-xs text-destructive truncate">
                      {log.errorMessage}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPendingRetry({
                      kind: "one",
                      id: log.id,
                      message: log.errorMessage || t("retryHint"),
                    })
                  }
                  disabled={retrySyncLog.isPending}
                >
                  {retrySyncLog.isPending ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-3 w-3" />
                  )}
                  {t("retryOne")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <ActionDialog
        open={pendingRetry !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRetry(null);
        }}
        title={t("title")}
        consequence={
          pendingRetry?.kind === "one"
            ? `${pendingRetry.message} ${t("retryHint")}`
            : t("retryHint")
        }
        confirmLabel={
          pendingRetry?.kind === "all" ? t("retryAll") : t("retryOne")
        }
        pending={retrySyncLog.isPending || retryAll.isPending}
        onConfirm={() => {
          if (pendingRetry?.kind === "all") retryAll.mutate();
          if (pendingRetry?.kind === "one") retrySyncLog.mutate(pendingRetry.id);
          setPendingRetry(null);
        }}
      />
    </Card>
  );
}
