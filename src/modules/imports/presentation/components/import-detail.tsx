"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/ui/components/badge";
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
import { useImportStatus } from "../hooks/use-imports";
import type { ImportRowData } from "../../domain/entities/import-batch.entity";

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
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
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
      className={`rounded-lg border p-3 ${
        row.isValid
          ? "border-neutral-200 dark:border-neutral-700"
          : "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/30"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">
          {t("detail.row")} #{row.rowNumber}
        </span>
        <Badge variant={row.isValid ? "success" : "error"}>
          {row.isValid ? t("detail.valid") : t("detail.invalid")}
        </Badge>
      </div>

      {/* Row data as compact key-value pairs */}
      <div className="space-y-0.5">
        {dataEntries.map(([key, value]) => (
          <div key={key} className="flex gap-2 text-xs">
            <span className="shrink-0 text-neutral-500">{key}:</span>
            <span className="truncate font-medium" title={String(value)}>
              {String(value)}
            </span>
          </div>
        ))}
      </div>

      {/* Errors */}
      {row.errors.length > 0 && (
        <div className="mt-2 rounded bg-red-100 p-2 dark:bg-red-950/50">
          <p className="text-xs font-medium text-red-600">
            {t("detail.errors")}:
          </p>
          <ul className="ml-3 list-disc text-xs text-red-600">
            {row.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {row.warnings.length > 0 && (
        <div className="mt-2 rounded bg-amber-100 p-2 dark:bg-amber-950/50">
          <p className="text-xs font-medium text-amber-600">
            {t("detail.warnings")}:
          </p>
          <ul className="ml-3 list-disc text-xs text-amber-600">
            {row.warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
