"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { formatCurrency, formatNumber } from "@/lib/number";

const TOP_COUNT = 10;

export interface InventoryShareItem {
  name: string;
  sku: string;
  brandName: string | null;
  quantity: number;
  value: number;
  sharePercent: number;
}

interface InventoryShareChartProps {
  data: InventoryShareItem[];
  currency: string;
}

function shareLabel(value: number, locale: string): string {
  return `${new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

export function InventoryShareChart({
  data,
  currency,
}: InventoryShareChartProps) {
  const t = useTranslations("dashboard.charts.inventoryShare");
  const locale = useLocale();
  const top = data.slice(0, TOP_COUNT);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("title")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            {t("noData")}
          </div>
        ) : (
          <ul className="space-y-3">
            {top.map((item) => {
              const width = Math.max(0, Math.min(item.sharePercent, 100));
              return (
                <li key={`${item.sku}-${item.name}`}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <p className="min-w-0 truncate font-medium text-foreground">
                      {item.name}
                      {item.brandName ? (
                        <span className="ml-2 font-normal text-muted-foreground">
                          {item.brandName}
                        </span>
                      ) : null}
                    </p>
                    <p className="shrink-0 tabular-nums text-foreground">
                      {formatCurrency(item.value, currency, locale)}
                      <span className="ml-2 text-muted-foreground">
                        {shareLabel(item.sharePercent, locale)}
                      </span>
                    </p>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.sku}
                    {" · "}
                    {t("units", {
                      count: formatNumber(item.quantity, locale),
                    })}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
