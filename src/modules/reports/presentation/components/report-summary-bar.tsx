"use client";

import { useLocale } from "next-intl";
import { Card, CardContent } from "@/ui/components/card";
import { formatCellValue, formatSummaryKey } from "../utils/report-utils";

interface ReportSummaryBarProps {
  summary: Record<string, number | string>;
}

export function ReportSummaryBar({ summary }: ReportSummaryBarProps) {
  const locale = useLocale();
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
                {formatSummaryKey(key)}
              </span>
              <span className="text-lg font-bold tabular-nums text-foreground">
                {formatCellValue(value, getType(key, value), locale)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
