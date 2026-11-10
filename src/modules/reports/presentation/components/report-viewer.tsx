"use client";

import { useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Clock, Database } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Badge } from "@/ui/components/badge";
import { Card, CardContent } from "@/ui/components/card";
import { Skeleton } from "@/ui/components/skeleton";
import { PageHeader } from "@/ui/layout/page-header";
import { ReportFiltersForm } from "./report-filters-form";
import { ReportTable } from "./report-table";
import { ReportSummaryBar } from "./report-summary-bar";
import { ReportExportButton } from "./report-export-button";
import { useReportView } from "@/modules/reports/presentation/hooks/use-reports";
import type {
  ReportTypeValue,
  ReportParameters,
} from "@/modules/reports/application/dto/report.dto";
import { getCategoryForReportType } from "@/modules/reports/presentation/utils/report-utils";

interface ReportViewerProps {
  type: ReportTypeValue;
  title: string;
  description: string;
}

export function ReportViewer({ type, title, description }: ReportViewerProps) {
  const locale = useLocale();
  const t = useTranslations("reports");
  const tCommon = useTranslations("errors");
  const [queryParams, setQueryParams] = useState<ReportParameters>({});

  const category = getCategoryForReportType(type);

  const {
    data: report,
    isLoading,
    isError,
    error,
    refetch,
  } = useReportView(type, queryParams);

  const handleFiltersChange = useCallback((newParams: ReportParameters) => {
    setQueryParams(newParams);
  }, []);

  // Detect currency from report rows (e.g. stock rows have a "currency" field)
  const currency = report?.rows?.find((r) => typeof r.currency === "string")
    ?.currency as string | undefined;

  const generatedAt = report?.metadata?.generatedAt
    ? new Date(report.metadata.generatedAt).toLocaleString(locale)
    : null;

  const stockCards = type === "AVAILABLE_INVENTORY";

  return (
    <div className="space-y-4">
      <Link
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        href={`/${locale}/dashboard/reports?tab=${category}` as any}
        className="text-sm font-semibold text-primary"
      >
        {t("backToReports")}
      </Link>

      <PageHeader
        title={title}
        description={description}
        action={
          <ReportExportButton
            type={type}
            parameters={queryParams}
            reportTitle={title}
            disabled={isLoading || !report}
          />
        }
      />

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {generatedAt ? (
          <p className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {generatedAt}
          </p>
        ) : null}
        {report?.fromCache ? (
          <Badge variant="secondary" className="gap-1 text-xs font-semibold">
            <Database className="h-3 w-3" />
            {t("fromCache")}
          </Badge>
        ) : null}
      </div>

      {/* Filters */}
      <ReportFiltersForm
        type={type}
        onGenerate={handleFiltersChange}
        loading={isLoading}
      />

      {/* Results */}
      {isLoading && (
        <Card className="rounded-xl">
          <CardContent className="space-y-2 p-4">
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
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {t("recordsFound", {
                count: report.metadata.totalRecords.toLocaleString(locale),
              })}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              {tCommon("tryAgain")}
            </Button>
          </div>

          {/* Summary */}
          {report.summary && Object.keys(report.summary).length > 0 && (
            <ReportSummaryBar summary={report.summary} currency={currency} />
          )}

          {/* Table */}
          <ReportTable
            columns={report.columns}
            rows={report.rows}
            locale={locale}
            currency={currency}
            mobileCards={stockCards}
          />
        </div>
      )}
    </div>
  );
}
