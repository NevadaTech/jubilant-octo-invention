"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/ui/components/card";
import {
  formatCellValue,
  formatSummaryKey,
} from "@/modules/reports/presentation/utils/report-utils";

interface ReportSummaryBarProps {
  summary: Record<string, number | string>;
  currency?: string;
}

export function ReportSummaryBar({ summary, currency }: ReportSummaryBarProps) {
  const locale = useLocale();
  const t = useTranslations("reports");

  const translateKey = (key: string): string => {
    const i18nKey = `summary.${key}`;
    return t.has(i18nKey) ? t(i18nKey) : formatSummaryKey(key);
  };
  const entries = Object.entries(summary).filter(
    ([, v]) => v !== null && v !== undefined,
  );

  if (entries.length === 0) return null;

  const isCurrencyKey = (key: string) =>
    key.toLowerCase().includes("value") ||
    key.toLowerCase().includes("revenue") ||
    key.toLowerCase().includes("cost") ||
    key.toLowerCase().includes("amount") ||
    key.toLowerCase().includes("margin");

  const isPercentKey = (key: string) =>
    key.toLowerCase().includes("percentage") ||
    key.toLowerCase().includes("rate");

  const getType = (key: string, value: unknown): string => {
    if (typeof value === "string") return "string";
    if (isCurrencyKey(key)) return "currency";
    if (isPercentKey(key)) return "percentage";
    return "number";
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-3">
        <div className="flex flex-wrap gap-6">
          {entries.map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {translateKey(key)}
              </span>
              <span className="text-lg font-bold tabular-nums text-foreground">
                {formatCellValue(value, getType(key, value), locale, currency)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
