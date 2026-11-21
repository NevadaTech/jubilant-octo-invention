"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { formatCurrency, formatNumber } from "@/lib/number";
import {
  buildReportChart,
  type ReportChartPoint,
} from "@/modules/reports/presentation/utils/report-utils";

interface ReportChartProps {
  rows: Record<string, unknown>[];
  currency?: string;
}

function shareLabel(value: number, locale: string): string {
  return `${new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

function ChartBars({
  title,
  description,
  points,
  kind,
  currency,
  locale,
  otherLabel,
}: {
  title: string;
  description: string;
  points: ReportChartPoint[];
  kind: "money" | "quantity";
  currency?: string;
  locale: string;
  otherLabel: string;
}) {
  return (
    <Card className="rounded-xl shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <ul className="max-h-[32rem] space-y-3 overflow-auto">
          {points.map((point) => {
            const label = point.isOther ? otherLabel : point.label;
            const width = Math.max(0, Math.min(point.share, 100));
            const amount =
              kind === "money"
                ? formatCurrency(point.value, currency || "COP", locale)
                : formatNumber(point.value, locale);
            return (
              <li key={`${label}-${point.value}`}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <p className="min-w-0 truncate font-medium text-foreground">
                    {label}
                  </p>
                  <p className="shrink-0 tabular-nums text-foreground">
                    {amount}
                    <span className="ml-2 text-muted-foreground">
                      {shareLabel(point.share, locale)}
                    </span>
                  </p>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

export function ReportChart({ rows, currency }: ReportChartProps) {
  const t = useTranslations("reports.chart");
  const tReports = useTranslations("reports");
  const locale = useLocale();
  const model = buildReportChart(rows);
  if (!model) {
    return (
      <Card className="rounded-xl shadow-none">
        <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          {tReports("noData")}
        </CardContent>
      </Card>
    );
  }

  const itemTitle =
    model.kind === "money" ? t("moneyTitle") : t("quantityTitle");
  const itemDescription =
    model.kind === "money" ? t("moneyDescription") : t("quantityDescription");

  return (
    <div className="space-y-4">
      <ChartBars
        title={itemTitle}
        description={itemDescription}
        points={model.points}
        kind={model.kind}
        currency={currency}
        locale={locale}
        otherLabel={t("other")}
      />
      {model.brandPoints ? (
        <ChartBars
          title={t("brandTitle")}
          description={t("brandDescription")}
          points={model.brandPoints}
          kind="money"
          currency={currency}
          locale={locale}
          otherLabel={t("other")}
        />
      ) : null}
    </div>
  );
}
