"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BarChart3, Package, Layers, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Label } from "@/ui/components/label";
import { DatePicker } from "@/ui/components/date-picker";
import { useComboStockImpact } from "@/modules/inventory/presentation/hooks/use-combos";
import type { GetComboStockImpactQueryDto } from "@/modules/inventory/application/dto/combo.dto";

interface ComboStockImpactProps {
  productId: string;
}

function StockImpactSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* eslint-disable @eslint-react/no-array-index-key */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700"
          />
        ))}
        {/* eslint-enable @eslint-react/no-array-index-key */}
      </div>
    </div>
  );
}

export function ComboStockImpact({ productId }: ComboStockImpactProps) {
  const t = useTranslations("inventory.combos");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const filters: GetComboStockImpactQueryDto = {
    dateFrom: dateFrom?.toISOString(),
    dateTo: dateTo?.toISOString(),
  };

  const {
    data: impactData,
    isLoading,
    isError,
    error,
  } = useComboStockImpact(productId, filters);

  if (isError) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-destructive">
            {t("error.loading")}: {error?.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {t("reports.stockImpact.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Date Range Filters */}
        <div className="mb-6 flex flex-wrap gap-4 rounded-lg border bg-muted/30 p-4">
          <div className="min-w-[180px] flex-1">
            <Label className="mb-2 block text-sm">
              {t("reports.dateFrom")}
            </Label>
            <DatePicker
              value={dateFrom}
              onChange={(d) => setDateFrom(d)}
              placeholder={t("reports.selectDate")}
              maxDate={dateTo}
            />
          </div>

          <div className="min-w-[180px] flex-1">
            <Label className="mb-2 block text-sm">{t("reports.dateTo")}</Label>
            <DatePicker
              value={dateTo}
              onChange={(d) => setDateTo(d)}
              placeholder={t("reports.selectDate")}
              minDate={dateFrom}
            />
          </div>
        </div>

        {isLoading ? (
          <StockImpactSkeleton />
        ) : !impactData ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="mb-4 h-12 w-12 text-neutral-400 dark:text-neutral-500" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("reports.stockImpact.empty")}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  {t("reports.stockImpact.directSales")}
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {impactData.directSalesQty.toLocaleString()}
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  {t("reports.stockImpact.comboSales")}
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {impactData.comboSalesQty.toLocaleString()}
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  {t("reports.stockImpact.total")}
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {impactData.totalQty.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Breakdown Table */}
            {impactData.comboBreakdown.length > 0 && (
              <div>
                <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                  {t("reports.stockImpact.breakdown")}
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-left text-sm font-medium text-muted-foreground">
                        <th className="px-4 py-3">{t("fields.sku")}</th>
                        <th className="px-4 py-3">{t("fields.name")}</th>
                        <th className="px-4 py-3">
                          {t("reports.stockImpact.unitsConsumed")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {impactData.comboBreakdown.map((row) => (
                        <tr
                          key={row.comboId}
                          className="border-b border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-primary-50/50 dark:hover:bg-primary-950/20"
                        >
                          <td className="px-4 py-3 text-sm text-foreground">
                            {row.sku}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-foreground">
                            {row.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {row.qty.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
