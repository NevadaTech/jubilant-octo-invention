"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  Bar,
  BarChart,
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

interface TopProductsChartProps {
  data: Array<{
    name: string;
    sku: string;
    revenue: number;
    quantitySold: number;
  }>;
  currency: string;
}

export function TopProductsChart({ data, currency }: TopProductsChartProps) {
  const t = useTranslations("dashboard.charts");
  const locale = useLocale();

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
                width={150}
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-sm">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {item.sku}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("topProducts.revenue")}:{" "}
                        {formatCurrency(item.revenue, currency, locale)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("topProducts.sold")}: {item.quantitySold}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
