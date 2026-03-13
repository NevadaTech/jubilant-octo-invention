"use client";

import { useTranslations, useLocale } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useIsMobile } from "@/hooks/use-media-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/ui/components/card";
import { formatCurrency, formatNumber } from "@/lib/number";

interface StockByCompanyChartProps {
  data: Array<{ companyName: string; quantity: number; value: number }>;
  currency: string;
}

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
  "var(--color-chart-7)",
  "var(--color-chart-8)",
];

export function StockByCompanyChart({
  data,
  currency,
}: StockByCompanyChartProps) {
  const t = useTranslations("dashboard.charts");
  const locale = useLocale();
  const isMobile = useIsMobile();

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("stockByCompany.title")}</CardTitle>
        <CardDescription>{t("stockByCompany.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            {t("noData")}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div className="w-full sm:w-[55%]">
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="companyName"
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 35 : 50}
                    outerRadius={isMobile ? 70 : 90}
                    paddingAngle={2}
                    stroke="var(--color-card)"
                    strokeWidth={2}
                  >
                    {data.map((_, idx) => (
                      // eslint-disable-next-line @eslint-react/no-array-index-key
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const item = payload[0].payload;
                      const idx = data.findIndex(
                        (d) => d.companyName === item.companyName,
                      );
                      return (
                        <div className="rounded-lg border bg-card p-3 shadow-md">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor: COLORS[idx % COLORS.length],
                              }}
                            />
                            <p className="text-sm font-medium text-card-foreground">
                              {item.companyName}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {t("stockByCompany.value")}:{" "}
                            {formatCurrency(item.value, currency, locale)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t("stockByCompany.units")}:{" "}
                            {formatNumber(item.quantity, locale)}
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex w-full flex-col gap-2 text-sm sm:w-auto">
              {data.map((item, idx) => (
                <div key={item.companyName} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{
                      backgroundColor: COLORS[idx % COLORS.length],
                    }}
                  />
                  <span className="truncate max-w-[120px]">
                    {item.companyName}
                  </span>
                  <span className="ml-auto text-muted-foreground">
                    {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
