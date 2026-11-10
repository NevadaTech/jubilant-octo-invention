"use client";

import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { Badge } from "@/ui/components/badge";
import { Button } from "@/ui/components/button";
import { Skeleton } from "@/ui/components/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from "@/ui/components/sheet";
import { ImportStatusBadge } from "./import-status-badge";
import {
  useImportStatus,
  useDownloadErrors,
} from "@/modules/imports/presentation/hooks/use-imports";
import type { ImportRowData } from "@/modules/imports/domain/entities/import-batch.entity";

interface ImportDetailSheetProps {
  batchId: string | null;
  onClose: () => void;
}

export function ImportDetailSheet({
  batchId,
  onClose,
}: ImportDetailSheetProps) {
  const t = useTranslations("imports");
  const { data: batch, isLoading } = useImportStatus(batchId);
  const downloadErrors = useDownloadErrors();

  return (
    <Sheet open={!!batchId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("detail.title")}</SheetTitle>
          {batch && <SheetDescription>{batch.fileName}</SheetDescription>}
        </SheetHeader>

        <SheetBody>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => `skeleton-${i}`).map(
                (key) => (
                  <Skeleton key={key} className="h-8 w-full" />
                ),
              )}
            </div>
          ) : !batch ? (
            <p className="py-8 text-center text-neutral-500">
              {t("history.empty")}
            </p>
          ) : (
            <div className="space-y-6">
              {/* Summary grid */}
              <div>
                <h4 className="mb-3 text-sm font-semibold text-neutral-500 uppercase tracking-wide">
                  {t("detail.summary")}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <SummaryItem
                    label={t("detail.type")}
                    value={t(`types.${batch.type.toLowerCase()}`)}
                  />
                  <SummaryItem label={t("detail.status")}>
                    <ImportStatusBadge status={batch.status} />
                  </SummaryItem>
                  <SummaryItem
                    label={t("detail.createdAt")}
                    value={new Date(batch.createdAt).toLocaleString()}
                  />
                  <SummaryItem
                    label={t("detail.totalRows")}
                    value={String(batch.totalRows)}
                  />
                  <SummaryItem
                    label={t("detail.validRows")}
                    value={String(batch.validRows)}
                    className="text-green-600"
                  />
                  <SummaryItem
                    label={t("detail.invalidRows")}
                    value={String(batch.invalidRows)}
                    className={batch.invalidRows > 0 ? "text-red-600" : ""}
                  />
                </div>

                {batch.errorMessage && (
                  <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                    {batch.errorMessage}
                  </div>
                )}

                {/* Execution failures (e.g. optimistic-lock conflicts) are stored
                    on the rows after schema validation already passed, so the
                    batch often stays COMPLETED with invalidRows=0. Gate on
                    row-level errors / errorMessage, not FAILED status. */}
                {batch.status !== "PENDING" &&
                  (Boolean(batch.errorMessage) ||
                    batch.invalidRows > 0 ||
                    batch.rows.some(
                      (row) => !row.isValid || row.errors.length > 0,
                    )) && (
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          downloadErrors.mutate({
                            id: batch.id,
                            format: "xlsx",
                          })
                        }
                        disabled={downloadErrors.isPending}
                      >
                        <Download className="mr-1 h-4 w-4" aria-hidden />
                        {t("errorReport.download")}
                      </Button>
                    </div>
                  )}
              </div>

              {/* Rows data */}
              <div>
                <h4 className="mb-3 text-sm font-semibold text-neutral-500 uppercase tracking-wide">
                  {t("detail.importedData")}
                </h4>

                {batch.rows.length === 0 ? (
                  <p className="py-4 text-center text-sm text-neutral-500">
                    {t("detail.noRows")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {batch.rows.map((row) => (
                      <ImportRowCard key={row.rowNumber} row={row} t={t} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

function SummaryItem({
  label,
  value,
  className,
  children,
}: {
  label: string;
  value?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border bg-neutral-50 p-2.5 dark:bg-neutral-900">
      <p className="text-xs text-neutral-500">{label}</p>
      {children ?? (
        <p className={`text-sm font-medium ${className ?? ""}`}>{value}</p>
      )}
    </div>
  );
}

function ImportRowCard({
  row,
  t,
}: {
  row: ImportRowData;
  t: ReturnType<typeof useTranslations>;
}) {
  const dataEntries = Object.entries(row.data).filter(
    ([, v]) => v !== null && v !== undefined && v !== "",
  );

  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        row.isValid
          ? "border-border bg-card"
          : "border-destructive/40 bg-destructive/5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-sm text-foreground">
          <span className="font-semibold">
            {t("detail.row")} #{row.rowNumber}
          </span>
          {dataEntries.map(([key, value]) => (
            <span key={key}>
              {" · "}
              <span>{String(value)}</span>
            </span>
          ))}
        </p>
        <Badge
          variant="outline"
          className={
            row.isValid
              ? "shrink-0 rounded-full border-transparent bg-success-100 px-2 py-0.5 text-xs font-semibold text-success-800"
              : "shrink-0 rounded-full border-transparent bg-error-100 px-2 py-0.5 text-xs font-semibold text-destructive"
          }
        >
          {row.isValid ? t("detail.valid") : t("detail.invalid")}
        </Badge>
      </div>

      {/* Errors */}
      {row.errors.length > 0 && (
        <ul className="mt-2 space-y-1">
          {row.errors.map((error) => (
            <li key={error} className="text-[13px] font-semibold text-destructive">
              {error}
            </li>
          ))}
        </ul>
      )}

      {/* Warnings */}
      {row.warnings.length > 0 && (
        <div className="mt-2 rounded bg-amber-100 p-2 dark:bg-amber-950/50">
          <p className="text-xs font-medium text-amber-600">
            {t("detail.warnings")}:
          </p>
          <ul className="ml-3 list-disc text-xs text-amber-600">
            {row.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
