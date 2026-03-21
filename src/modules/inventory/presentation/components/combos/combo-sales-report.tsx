"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Label } from "@/ui/components/label";
import { DatePicker } from "@/ui/components/date-picker";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/ui/components/searchable-select";
import {
  useCombos,
  useComboSalesReport,
} from "@/modules/inventory/presentation/hooks/use-combos";
import type { GetComboSalesReportQueryDto } from "@/modules/inventory/application/dto/combo.dto";

function formatCurrency(amount: number, currency = "COP"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function ReportSkeleton() {
  return (
    <div className="space-y-4">
      {/* eslint-disable @eslint-react/no-array-index-key */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
        >
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
          </div>
        </div>
      ))}
      {/* eslint-enable @eslint-react/no-array-index-key */}
    </div>
  );
}

export function ComboSalesReport() {
  const t = useTranslations("inventory.combos");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [selectedComboId, setSelectedComboId] = useState<string>("");

  const filters: GetComboSalesReportQueryDto = {
    dateFrom: dateFrom?.toISOString(),
    dateTo: dateTo?.toISOString(),
    comboId: selectedComboId || undefined,
  };

  const {
    data: reportData,
    isLoading,
    isError,
    error,
  } = useComboSalesReport(filters);
  const { data: combosData } = useCombos({ limit: 200 });

  const comboOptions: SearchableSelectOption[] = useMemo(
    () =>
      combosData?.data.map((c) => ({
        value: c.id,
        label: c.name,
        description: c.sku,
      })) ?? [],
    [combosData],
  );

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
        <CardTitle className="text-xl">{t("reports.sales.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
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

          <div className="min-w-[220px] flex-1">
            <Label className="mb-2 block text-sm">
              {t("reports.comboFilter")}
            </Label>
            <SearchableSelect
              options={comboOptions}
              value={selectedComboId}
              onValueChange={setSelectedComboId}
              placeholder={t("reports.allCombos")}
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <ReportSkeleton />
        ) : !reportData?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="mb-4 h-12 w-12 text-neutral-400 dark:text-neutral-500" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("reports.sales.empty")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm font-medium text-muted-foreground">
                  <th className="px-4 py-3">{t("fields.sku")}</th>
                  <th className="px-4 py-3">{t("fields.name")}</th>
                  <th className="px-4 py-3">{t("reports.sales.unitsSold")}</th>
                  <th className="px-4 py-3">{t("reports.sales.revenue")}</th>
                  <th className="px-4 py-3">{t("reports.sales.salesCount")}</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item) => (
                  <tr
                    key={item.comboId}
                    className="border-b border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-primary-50/50 dark:hover:bg-primary-950/20"
                  >
                    <td className="px-4 py-3 text-sm text-foreground">
                      {item.sku}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {item.totalComboUnitsSold.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {formatCurrency(item.totalRevenue)}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {item.salesCount.toLocaleString()}
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
