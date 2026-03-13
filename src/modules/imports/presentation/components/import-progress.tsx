"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/ui/components/card";
import { Button } from "@/ui/components/button";
import { Progress } from "@/ui/components/progress";
import { Download, CheckCircle2, XCircle } from "lucide-react";
import { ImportStatusBadge } from "./import-status-badge";
import {
  useImportStatus,
  useDownloadErrors,
} from "@/modules/imports/presentation/hooks/use-imports";
import type { ImportBatch } from "@/modules/imports/domain/entities";

interface ImportProgressProps {
  batchId: string;
  initialBatch?: ImportBatch;
}

export function ImportProgress({ batchId, initialBatch }: ImportProgressProps) {
  const t = useTranslations("imports");
  const { data: batch } = useImportStatus(batchId);
  const downloadErrors = useDownloadErrors();

  const current = batch ?? initialBatch;
  if (!current) return null;

  const isCompleted = current.status === "COMPLETED";
  const isFailed = current.status === "FAILED";

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-semibold">{t("execute.title")}</h4>
            <ImportStatusBadge status={current.status} />
          </div>

          <Progress value={current.progress} className="mb-3" />

          <div className="flex justify-between text-sm text-neutral-500">
            <span>
              {t("execute.progress", {
                processed: current.processedRows,
                total: current.totalRows,
              })}
            </span>
            <span>{current.progress}%</span>
          </div>

          {isCompleted && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-800 dark:bg-green-950 dark:text-green-200">
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <p className="font-medium">{t("execute.completed")}</p>
                <p className="text-sm">
                  {current.validRows} / {current.totalRows}
                </p>
              </div>
            </div>
          )}

          {isFailed && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-800 dark:bg-red-950 dark:text-red-200">
                <XCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">{t("execute.failed")}</p>
                  {current.errorMessage && (
                    <p className="text-sm">{current.errorMessage}</p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadErrors.mutate({ id: batchId, format: "xlsx" })
                }
                disabled={downloadErrors.isPending}
              >
                <Download className="mr-1 h-4 w-4" />
                {t("errorReport.download")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
