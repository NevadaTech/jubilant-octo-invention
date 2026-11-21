"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { formatCurrency, formatNumber } from "@/lib/number";

const PREVIEW_COUNT = 10;

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
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return data;
    return data.filter((item) =>
      [item.name, item.sku, item.brandName ?? ""].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    );
  }, [data, query]);

  const visible = expanded ? filtered : filtered.slice(0, PREVIEW_COUNT);
  const canToggle = filtered.length > PREVIEW_COUNT;

  const maxShare = visible.reduce(
    (max, item) => Math.max(max, item.sharePercent),
    0,
  );

  return (
    <Card>
      <CardHeader className="gap-3 pb-2">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-base">{t("title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("description")}</p>
          </div>
          {data.length > 0 ? (
            <p className="text-sm tabular-nums text-muted-foreground">
              {t("showing", { shown: visible.length, total: data.length })}
            </p>
          ) : null}
        </div>
        {data.length > 0 ? (
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("search")}
            aria-label={t("search")}
            className="h-9 max-w-sm"
          />
        ) : null}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            {t("noData")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            {t("noMatches")}
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className={expanded ? "max-h-[32rem] overflow-auto" : undefined}
            >
              <table className="w-full min-w-[640px] text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b text-left">
                    <th className="px-2 py-2 font-medium text-muted-foreground">
                      {t("product")}
                    </th>
                    <th className="px-2 py-2 font-medium text-muted-foreground">
                      {t("sku")}
                    </th>
                    <th className="px-2 py-2 font-medium text-muted-foreground">
                      {t("brand")}
                    </th>
                    <th className="px-2 py-2 text-right font-medium text-muted-foreground">
                      {t("unitsLabel")}
                    </th>
                    <th className="px-2 py-2 text-right font-medium text-muted-foreground">
                      {t("value")}
                    </th>
                    <th className="px-2 py-2 text-right font-medium text-muted-foreground">
                      {t("share")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => {
                    const width =
                      maxShare > 0
                        ? Math.max(
                            0,
                            Math.min((item.sharePercent / maxShare) * 100, 100),
                          )
                        : 0;
                    return (
                      <tr
                        key={`${item.sku}-${item.name}`}
                        className="border-b last:border-0"
                      >
                        <td className="px-2 py-2 font-medium text-foreground">
                          {item.name}
                        </td>
                        <td className="px-2 py-2 font-mono text-xs text-muted-foreground">
                          {item.sku}
                        </td>
                        <td className="px-2 py-2 text-muted-foreground">
                          {item.brandName ?? "—"}
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {formatNumber(item.quantity, locale)}
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {formatCurrency(item.value, currency, locale)}
                        </td>
                        <td className="px-2 py-2 text-right">
                          <span className="tabular-nums">
                            {shareLabel(item.sharePercent, locale)}
                          </span>
                          <div className="mt-1 ml-auto h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {canToggle ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setExpanded((open) => !open)}
              >
                {expanded ? t("showLess") : t("showMore")}
              </Button>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
