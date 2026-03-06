"use client";

import { useTranslations, useLocale } from "next-intl";
import { useIsMobile } from "@/hooks/use-media-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

interface TopProductsChartProps {
  data: Array<{
    name: string;
    sku: string;
    revenue: number;
    quantitySold: number;
  }>;
  currency: string;
}

const BAR_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export function TopProductsChart({ data, currency }: TopProductsChartProps) {
  const t = useTranslations("dashboard.charts");
  const locale = useLocale();
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("topProducts.title")}</CardTitle>
        <CardDescription>{t("topProducts.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            {t("noData")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                horizontal={false}
              />
              <XAxis
                type="number"
                tickFormatter={(v) =>
                  formatCompactCurrency(v, currency, locale)
                }
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <YAxis
                type="category"
                dataKey="name"
                width={isMobile ? 80 : 150}
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <Tooltip
                wrapperStyle={{ outline: "none" }}
                cursor={{ fill: "oklch(50% 0.02 250 / 0.15)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0].payload;
                  const idx = data.findIndex((d) => d.sku === item.sku);
                  return (
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-md dark:border-neutral-700 dark:bg-neutral-900">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              BAR_COLORS[idx % BAR_COLORS.length],
                          }}
                        />
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {item.name}
                        </p>
                      </div>
                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                        SKU: {item.sku}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {t("topProducts.revenue")}:{" "}
                        {formatCurrency(item.revenue, currency, locale)}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {t("topProducts.sold")}: {item.quantitySold}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={24}>
                {data.map((_, idx) => (
                  // eslint-disable-next-line @eslint-react/no-array-index-key
                  <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
