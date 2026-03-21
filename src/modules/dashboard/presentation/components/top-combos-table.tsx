"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/ui/components/card";
import { formatCurrency, formatNumber } from "@/lib/number";

interface TopCombosTableProps {
  data: Array<{
    sku: string;
    name: string;
    totalComboUnitsSold: number;
    totalRevenue: number;
  }>;
  currency: string;
}

export function TopCombosTable({ data, currency }: TopCombosTableProps) {
  const t = useTranslations("dashboard.charts");
  const locale = useLocale();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("topCombos.title")}</CardTitle>
        <CardDescription>{t("topCombos.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            {t("noData")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium text-muted-foreground">
                    {t("topCombos.sku")}
                  </th>
                  <th className="pb-2 font-medium text-muted-foreground">
                    {t("topCombos.name")}
                  </th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">
                    {t("topCombos.sold")}
                  </th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">
                    {t("topCombos.revenue")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((combo) => (
                  <tr key={combo.sku} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs">{combo.sku}</td>
                    <td className="py-2 truncate max-w-[150px]">
                      {combo.name}
                    </td>
                    <td className="py-2 text-right">
                      {formatNumber(combo.totalComboUnitsSold, locale)}
                    </td>
                    <td className="py-2 text-right font-medium">
                      {formatCurrency(combo.totalRevenue, currency, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
