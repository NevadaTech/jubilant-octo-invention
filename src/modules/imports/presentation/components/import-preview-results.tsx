"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/ui/components/card";
import { Badge } from "@/ui/components/badge";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { ImportPreview } from "@/modules/imports/domain/entities/import-preview.entity";

interface ImportPreviewResultsProps {
  preview: ImportPreview;
}

export function ImportPreviewResults({ preview }: ImportPreviewResultsProps) {
  const t = useTranslations("imports.preview");

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <h4 className="mb-3 font-semibold">{t("summary")}</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{preview.totalRows}</p>
              <p className="text-sm text-neutral-500">{t("totalRows")}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {preview.validRows}
              </p>
              <p className="text-sm text-neutral-500">{t("validRows")}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {preview.invalidRows}
              </p>
              <p className="text-sm text-neutral-500">{t("invalidRows")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status indicator */}
      {preview.canBeProcessed ? (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-800 dark:bg-green-950 dark:text-green-200">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">{t("canProcess")}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-800 dark:bg-red-950 dark:text-red-200">
          <XCircle className="h-5 w-5" />
          <span className="text-sm font-medium">{t("cannotProcess")}</span>
        </div>
      )}

      {/* Structure Errors */}
      {preview.structureErrors.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="mb-2 font-semibold text-red-600">
              {t("structureErrors")}
            </h4>
            <ul className="space-y-1">
              {preview.structureErrors.map((err) => (
                <li
                  key={err.message}
                  className="flex items-start gap-2 text-sm"
                >
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
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
            <h4 className="mb-2 font-semibold text-red-600">
              {t("rowErrors")}
            </h4>
            <div className="max-h-60 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 pr-4">Row</th>
                    <th className="pb-2 pr-4">Column</th>
                    <th className="pb-2 pr-4">Error</th>
                    <th className="pb-2">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rowErrors.map((err) => (
                    <tr
                      key={`${err.rowNumber}-${err.column ?? ""}-${err.error}`}
                      className="border-b last:border-0"
                    >
                      <td className="py-1.5 pr-4">{err.rowNumber}</td>
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

      {/* Warnings */}
      {preview.hasWarnings && (
        <Card>
          <CardContent className="p-4">
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              {t("warnings")}
            </h4>
            <ul className="space-y-1">
              {preview.warnings.map((warning) => (
                <li
                  key={warning}
                  className="text-sm text-amber-700 dark:text-amber-300"
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
