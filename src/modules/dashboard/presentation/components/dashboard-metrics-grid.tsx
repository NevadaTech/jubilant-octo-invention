"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  Package,
  DollarSign,
  AlertTriangle,
  ShoppingCart,
  RefreshCw,
} from "lucide-react";
import { useDashboardMetrics } from "../hooks/use-dashboard-metrics";
import { StatCard, type StatCardColor } from "./stat-card";
import { StatCardSkeleton } from "./stat-card-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Button } from "@/ui/components/button";
import { formatCurrency, formatNumber } from "@/lib/number";

export function DashboardMetricsGrid() {
  const t = useTranslations("dashboard.metrics");
  const locale = useLocale();
  const { metrics, isLoading, isError, refetch } = useDashboardMetrics();

  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="text-destructive">
              {t("error.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4">
            <p className="text-sm text-muted-foreground">
              {t("error.description")}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("error.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>{t("empty.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("empty.description")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine low stock card color based on count
  const lowStockColor: StatCardColor =
    metrics.lowStock.criticalCount > 0 ? "error" : "success";
  const lowStockDescription =
    metrics.lowStock.criticalCount > 0
      ? t("lowStock.descriptionAlert")
      : t("lowStock.descriptionOk");

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title={t("totalProducts.title")}
        value={formatNumber(metrics.inventory.totalProducts, locale)}
        description={t("totalProducts.description", {
          quantity: formatNumber(metrics.inventory.totalQuantity, locale),
        })}
        icon={Package}
        color="primary"
      />

      <StatCard
        title={t("inventoryValue.title")}
        value={formatCurrency(
          metrics.inventory.totalValue,
          metrics.inventory.currency,
          locale,
        )}
        description={t("inventoryValue.description")}
        icon={DollarSign}
        color="success"
      />

      <StatCard
        title={t("lowStock.title")}
        value={formatNumber(metrics.lowStock.criticalCount, locale)}
        description={lowStockDescription}
        icon={AlertTriangle}
        color={lowStockColor}
      />

      <StatCard
        title={t("monthlySales.title")}
        value={formatCurrency(metrics.sales.monthlyRevenue, "USD", locale)}
        description={t("monthlySales.description", {
          count: metrics.sales.monthlyTotal,
        })}
        icon={ShoppingCart}
        color="primary"
      />
    </div>
  );
}
