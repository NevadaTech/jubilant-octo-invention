"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/ui/components/card";
import { formatCurrency, formatCompactCurrency } from "@/lib/number";

interface SalesTrendChartProps {
  data: Array<{ date: string; count: number; revenue: number }>;
  currency: string;
}

export function SalesTrendChart({ data, currency }: SalesTrendChartProps) {
  const t = useTranslations("dashboard.charts");
  const locale = useLocale();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("salesTrend.title")}</CardTitle>
        <CardDescription>{t("salesTrend.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            {t("noData")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart
              data={data}
              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tickFormatter={(v) =>
                  formatCompactCurrency(v, currency, locale)
                }
                tick={{ fontSize: 11 }}
                width={90}
                className="text-muted-foreground"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-sm">
                      <p className="text-sm font-medium">
                        {formatDate(String(label))}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("salesTrend.revenue")}:{" "}
                        {formatCurrency(
                          payload[0].value as number,
                          currency,
                          locale,
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("salesTrend.orders")}: {payload[0].payload.count}
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
