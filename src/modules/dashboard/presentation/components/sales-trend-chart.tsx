"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
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
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-chart-2)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-chart-2)"
                    stopOpacity={0.02}
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
                yAxisId="revenue"
                tickFormatter={(v) =>
                  formatCompactCurrency(v, currency, locale)
                }
                tick={{ fontSize: 11 }}
                width={90}
                className="text-muted-foreground"
              />
              <YAxis
                yAxisId="orders"
                orientation="right"
                tick={{ fontSize: 11 }}
                width={40}
                className="text-muted-foreground"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const rev = payload.find((p) => p.dataKey === "revenue");
                  const ord = payload.find((p) => p.dataKey === "count");
                  return (
                    <div className="rounded-lg border bg-card p-3 shadow-md">
                      <p className="text-sm font-medium text-card-foreground">
                        {formatDate(String(label))}
                      </p>
                      {rev && (
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: "var(--color-chart-1)" }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {t("salesTrend.revenue")}:{" "}
                            {formatCurrency(
                              rev.value as number,
                              currency,
                              locale,
                            )}
                          </span>
                        </div>
                      )}
                      {ord && (
                        <div className="mt-0.5 flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: "var(--color-chart-2)" }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {t("salesTrend.orders")}: {ord.value}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              <Legend
                verticalAlign="top"
                height={30}
                formatter={(value: string) => (
                  <span className="text-xs text-muted-foreground">
                    {value === "revenue"
                      ? t("salesTrend.revenue")
                      : t("salesTrend.orders")}
                  </span>
                )}
              />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-chart-1)"
                fill="url(#colorRevenue)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
              <Area
                yAxisId="orders"
                type="monotone"
                dataKey="count"
                stroke="var(--color-chart-2)"
                fill="url(#colorOrders)"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
