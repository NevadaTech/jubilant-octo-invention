"use client";

import { useTranslations, useLocale } from "next-intl";
import { Package, DollarSign, AlertTriangle, ShoppingCart } from "lucide-react";
import { StatCard, type StatCardColor } from "./stat-card";
import type { DashboardMetricsDto } from "@/modules/dashboard/application/dto/metrics.dto";
import { formatCurrency, formatNumber } from "@/lib/number";

interface DashboardMetricsGridProps {
  metrics: DashboardMetricsDto;
}

export function DashboardMetricsGrid({ metrics }: DashboardMetricsGridProps) {
  const t = useTranslations("dashboard.metrics");
  const locale = useLocale();

  const lowStockColor: StatCardColor =
    metrics.lowStock.count > 0 ? "error" : "success";
  const lowStockDescription =
    metrics.lowStock.count > 0
      ? t("lowStock.descriptionAlert")
      : t("lowStock.descriptionOk");

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title={t("totalProducts.title")}
        value={formatNumber(metrics.inventory.totalProducts, locale)}
        description={t("totalProducts.description", {
          quantity: formatNumber(metrics.inventory.totalStockQuantity, locale),
        })}
        icon={Package}
        color="primary"
      />

      <StatCard
        title={t("inventoryValue.title")}
        value={formatCurrency(
          metrics.inventory.totalInventoryValue,
          metrics.inventory.currency,
          locale,
        )}
        description={t("inventoryValue.description")}
        icon={DollarSign}
        color="success"
      />

      <StatCard
        title={t("lowStock.title")}
        value={formatNumber(metrics.lowStock.count, locale)}
        description={lowStockDescription}
        icon={AlertTriangle}
        color={lowStockColor}
      />

      <StatCard
        title={t("monthlySales.title")}
        value={formatCurrency(
          metrics.sales.monthlyRevenue,
          metrics.sales.currency,
          locale,
        )}
        description={t("monthlySales.description", {
          count: metrics.sales.monthlyCount,
        })}
        icon={ShoppingCart}
        color="primary"
      />
    </div>
  );
}
