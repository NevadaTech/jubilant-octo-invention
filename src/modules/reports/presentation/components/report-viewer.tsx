"use client";

import { useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Clock, Database } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Badge } from "@/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Skeleton } from "@/ui/components/skeleton";
import { ReportFiltersForm } from "./report-filters-form";
import { ReportTable } from "./report-table";
import { ReportSummaryBar } from "./report-summary-bar";
import { ReportExportButton } from "./report-export-button";
import { useReportView } from "../hooks/use-reports";
import type {
  ReportTypeValue,
  ReportParameters,
} from "../../application/dto/report.dto";

interface ReportViewerProps {
  type: ReportTypeValue;
  title: string;
  description: string;
}

export function ReportViewer({ type, title, description }: ReportViewerProps) {
  const locale = useLocale();
  const t = useTranslations("reports");
  const tCommon = useTranslations("errors");
  const [params, setParams] = useState<ReportParameters | null>(null);
  const [queryParams, setQueryParams] = useState<ReportParameters | undefined>(
    undefined,
  );

  const {
    data: report,
    isLoading,
    isError,
    error,
    refetch,
  } = useReportView(params !== null ? type : null, queryParams);

  const handleGenerate = useCallback((newParams: ReportParameters) => {
    setParams(newParams);
    setQueryParams(newParams);
  }, []);

  const generatedAt = report?.metadata?.generatedAt
    ? new Date(report.metadata.generatedAt).toLocaleString(locale)
    : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="mt-0.5 shrink-0"
            aria-label={t("backToReports")}
          >
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Link href={`/${locale}/dashboard/reports` as any}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">{title}</h1>
              {report?.fromCache && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Database className="h-3 w-3" />
                  {t("fromCache")}
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
            {generatedAt && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {generatedAt}
              </p>
            )}
          </div>
        </div>

        {report && (
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {tCommon("tryAgain")}
            </Button>
            <ReportExportButton
              type={type}
              parameters={queryParams}
              reportTitle={title}
              disabled={isLoading}
            />
          </div>
        )}
      </div>

      {/* Filters */}
      <ReportFiltersForm
        type={type}
        onGenerate={handleGenerate}
        loading={isLoading}
      />

      {/* Results */}
      {params === null && !isLoading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-sm font-medium">{t("noData")}</p>
            <p className="mt-1 text-xs">{t("noDataDescription")}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-8 w-full" />
            {Array.from({ length: 6 }).map((_, i) => (
              // eslint-disable-next-line @eslint-react/no-array-index-key
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="font-medium text-destructive">
              {t("errors.loadFailed")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {(error as Error)?.message ?? tCommon("somethingWentWrong")}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => refetch()}
            >
              {tCommon("tryAgain")}
            </Button>
          </CardContent>
        </Card>
      )}

      {report && !isLoading && (
        <div className="space-y-4">
          {/* Record count + export (on mobile) */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("recordsFound", {
                count: report.metadata.totalRecords.toLocaleString(locale),
              })}
            </p>
            <div className="flex sm:hidden">
              <ReportExportButton
                type={type}
                parameters={queryParams}
                reportTitle={title}
              />
            </div>
          </div>

          {/* Summary */}
          {report.summary && Object.keys(report.summary).length > 0 && (
            <ReportSummaryBar summary={report.summary} />
          )}

          {/* Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                {report.metadata.reportTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ReportTable
                columns={report.columns}
                rows={report.rows}
                locale={locale}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
