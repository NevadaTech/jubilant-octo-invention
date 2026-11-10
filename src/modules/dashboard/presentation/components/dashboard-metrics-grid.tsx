"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  Package,
  DollarSign,
  AlertTriangle,
  ShoppingCart,
  Layers,
  PackageX,
} from "lucide-react";
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

  const combosOutOfStockColor: StatCardColor =
    metrics.combos && metrics.combos.combosWithZeroAvailability > 0
      ? "error"
      : "success";
  const combosOutOfStockDescription =
    metrics.combos && metrics.combos.combosWithZeroAvailability > 0
      ? t("combosOutOfStock.descriptionAlert")
      : t("combosOutOfStock.descriptionOk");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
        <div className="order-1">
          <StatCard
            title={t("totalProducts.title")}
            shortTitle={t("totalProducts.short")}
            value={formatNumber(metrics.inventory.totalProducts, locale)}
            description={t("totalProducts.description", {
              quantity: formatNumber(
                metrics.inventory.totalStockQuantity,
                locale,
              ),
            })}
            icon={Package}
            color="primary"
          />
        </div>

        <div className="order-4 lg:order-2">
          <StatCard
            title={t("inventoryValue.title")}
            shortTitle={t("inventoryValue.short")}
            value={formatCurrency(
              metrics.inventory.totalInventoryValue,
              metrics.inventory.currency,
              locale,
            )}
            description={t("inventoryValue.description")}
            icon={DollarSign}
            color="success"
          />
        </div>

        <div className="order-2 lg:order-3">
          <StatCard
            title={t("lowStock.title")}
            shortTitle={t("lowStock.short")}
            value={formatNumber(metrics.lowStock.count, locale)}
            description={lowStockDescription}
            icon={AlertTriangle}
            color={lowStockColor}
          />
        </div>

        <div className="order-3 lg:order-4">
          <StatCard
            title={t("monthlySales.title")}
            shortTitle={t("monthlySales.short")}
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
      </div>

      {metrics.combos && (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
          <StatCard
            title={t("activeCombos.title")}
            value={formatNumber(metrics.combos.totalActiveCombos, locale)}
            description={t("activeCombos.description", {
              count: metrics.combos.totalActiveCombos,
            })}
            icon={Layers}
            color="primary"
          />

          <StatCard
            title={t("combosOutOfStock.title")}
            value={formatNumber(
              metrics.combos.combosWithZeroAvailability,
              locale,
            )}
            description={combosOutOfStockDescription}
            icon={PackageX}
            color={combosOutOfStockColor}
          />
        </div>
      )}
    </div>
  );
}
