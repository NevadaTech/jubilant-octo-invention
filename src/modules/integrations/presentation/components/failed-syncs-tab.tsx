"use client";

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

interface FailedSyncsTabProps {
  connectionId: string;
}

export function FailedSyncsTab({ connectionId }: FailedSyncsTabProps) {
  const locale = useLocale();
  const t = useTranslations("integrations.failedSyncs");
  const tCommon = useTranslations("common");
  const retrySyncLog = useRetrySyncLog(connectionId);
  const retryAll = useRetryAllFailed(connectionId);

  const { data: result, isLoading } = useSyncLogs(connectionId, {
    action: "FAILED",
    limit: 50,
  });

  const failedLogs = result?.data ?? [];

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
              onClick={() => retryAll.mutate()}
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
                  onClick={() => retrySyncLog.mutate(log.id)}
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
    </Card>
  );
}
