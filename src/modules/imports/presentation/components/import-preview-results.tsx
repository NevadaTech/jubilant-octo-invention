"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/ui/components/card";
import { Badge } from "@/ui/components/badge";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { ImportPreview } from "@/modules/imports/domain/entities/import-preview.entity";
import { ImportReferencesPreview } from "./import-references-preview";

interface ImportPreviewResultsProps {
  preview: ImportPreview;
  fileName?: string;
}

export function ImportPreviewResults({
  preview,
  fileName,
}: ImportPreviewResultsProps) {
  const t = useTranslations("imports.preview");
  const tImports = useTranslations("imports");
  const tFlow = useTranslations("imports.wizardFlow");
  const firstRowError = preview.rowErrors[0];
  const firstStructureError = preview.structureErrors[0];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">
          {tImports("module")}
        </p>
        <h3 className="text-lg font-semibold text-foreground">
          {tFlow("runDryRun")}
        </h3>
        {fileName ? (
          <p className="text-sm text-foreground">
            {t("fileStep", { file: fileName, step: tImports("wizard.validate") })}
          </p>
        ) : null}
        {firstRowError ? (
          <p className="text-sm text-foreground">
            {t("rowIssue", {
              row: firstRowError.rowNumber,
              error: firstRowError.error,
            })}
          </p>
        ) : firstStructureError ? (
          <p className="text-sm text-foreground">{firstStructureError.message}</p>
        ) : null}
        <p className="text-sm text-muted-foreground lg:hidden">
          {preview.canBeProcessed ? t("canProcess") : t("cannotProcess")}
        </p>
      </div>
      {/* Summary counters with subtle entrance animation */}
      <Card>
        <CardContent className="p-4">
          <h4 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            {t("summary")}
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <CounterCell
              value={preview.totalRows}
              label={t("totalRows")}
              tone="default"
            />
            <CounterCell
              value={preview.validRows}
              label={t("validRows")}
              tone="success"
            />
            <CounterCell
              value={preview.invalidRows}
              label={t("invalidRows")}
              tone="danger"
            />
          </div>
        </CardContent>
      </Card>

      {/* Top-level status banner */}
      {preview.canBeProcessed ? (
        <StatusBanner tone="success" icon={CheckCircle2}>
          {t("canProcess")}
        </StatusBanner>
      ) : (
        <StatusBanner tone="danger" icon={XCircle}>
          {t("cannotProcess")}
        </StatusBanner>
      )}

      {/* References preview — key differentiator for onboarding */}
      <ImportReferencesPreview
        references={preview.references}
        hasReferences={preview.hasReferences}
        hasPossibleDuplicates={preview.hasPossibleDuplicates}
      />

      {/* Structure Errors */}
      {preview.structureErrors.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="mb-2 text-sm font-semibold text-rose-600 dark:text-rose-400">
              {t("structureErrors")}
            </h4>
            <ul className="space-y-1">
              {preview.structureErrors.map((err) => (
                <li
                  key={err.message}
                  className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                >
                  <XCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-rose-500"
                    aria-hidden
                  />
                  {err.message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Row Errors */}
      {preview.rowErrors.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="mb-2 text-sm font-semibold text-rose-600 dark:text-rose-400">
              {t("rowErrors")}
            </h4>
            <div className="max-h-60 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-neutral-500">
                    <th className="pb-2 pr-4 font-medium">Row</th>
                    <th className="pb-2 pr-4 font-medium">Column</th>
                    <th className="pb-2 pr-4 font-medium">Error</th>
                    <th className="pb-2 font-medium">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rowErrors.map((err) => (
                    <tr
                      key={`${err.rowNumber}-${err.column ?? ""}-${err.error}`}
                      className="border-b last:border-0"
                    >
                      <td className="py-1.5 pr-4 tabular-nums">
                        {err.rowNumber}
                      </td>
                      <td className="py-1.5 pr-4">{err.column ?? "-"}</td>
                      <td className="py-1.5 pr-4">{err.error}</td>
                      <td className="py-1.5">
                        <Badge
                          variant={
                            err.severity === "error" ? "error" : "warning"
                          }
                        >
                          {err.severity}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Column-level warnings from the server */}
      {preview.hasWarnings && (
        <Card>
          <CardContent className="p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              {t("warnings")}
            </h4>
            <ul className="space-y-1">
              {preview.warnings.map((warning) => (
                <li
                  key={warning}
                  className="text-sm text-amber-800 dark:text-amber-200/80"
                >
                  {warning}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface CounterCellProps {
  value: number;
  label: string;
  tone: "default" | "success" | "danger";
}

function CounterCell({ value, label, tone }: CounterCellProps) {
  const toneClass =
    tone === "success"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "danger"
        ? "text-rose-600 dark:text-rose-400"
        : "text-neutral-900 dark:text-neutral-50";

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="text-center"
    >
      <p className={`text-2xl font-bold tabular-nums ${toneClass}`}>{value}</p>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
    </motion.div>
  );
}

interface StatusBannerProps {
  tone: "success" | "danger";
  icon: React.ElementType;
  children: React.ReactNode;
}

function StatusBanner({ tone, icon: Icon, children }: StatusBannerProps) {
  const color =
    tone === "success"
      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
      : "bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200";

  return (
    <div
      role="status"
      className={`flex items-center gap-2 rounded-lg p-3 text-sm font-medium ${color}`}
    >
      <Icon className="h-5 w-5" aria-hidden />
      <span>{children}</span>
    </div>
  );
}
