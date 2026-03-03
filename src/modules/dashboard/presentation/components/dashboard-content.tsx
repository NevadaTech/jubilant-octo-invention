"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { useDashboardMetrics } from "@/modules/dashboard/presentation/hooks/use-dashboard-metrics";
import { DashboardMetricsGrid } from "./dashboard-metrics-grid";
import { StatCardSkeleton } from "./stat-card-skeleton";
import { ChartSkeleton } from "./chart-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Button } from "@/ui/components/button";

const SalesTrendChart = dynamic(
  () => import("./sales-trend-chart").then((m) => m.SalesTrendChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
const TopProductsChart = dynamic(
  () => import("./top-products-chart").then((m) => m.TopProductsChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
const StockDistributionChart = dynamic(
  () =>
    import("./stock-distribution-chart").then((m) => m.StockDistributionChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
const RecentActivityFeed = dynamic(
  () => import("./recent-activity-feed").then((m) => m.RecentActivityFeed),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export function DashboardContent() {
  const t = useTranslations("dashboard.metrics");
  const { metrics, isLoading, isError, refetch } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid gap-4 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <ChartSkeleton />
          </div>
          <div className="lg:col-span-3">
            <ChartSkeleton />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-7">
          <div className="lg:col-span-3">
            <ChartSkeleton />
          </div>
          <div className="lg:col-span-4">
            <ChartSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">{t("error.title")}</CardTitle>
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
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("empty.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("empty.description")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards Row */}
      <DashboardMetricsGrid metrics={metrics} />

      {/* Charts Row 1: Sales Trend + Stock Distribution */}
      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <SalesTrendChart
            data={metrics.salesTrend}
            currency={metrics.sales.currency}
          />
        </div>
        <div className="lg:col-span-3">
          <StockDistributionChart
            data={metrics.stockByWarehouse}
            currency={metrics.inventory.currency}
          />
        </div>
      </div>

      {/* Charts Row 2: Top Products + Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-3">
          <TopProductsChart
            data={metrics.topProducts}
            currency={metrics.sales.currency}
          />
        </div>
        <div className="lg:col-span-4">
          <RecentActivityFeed data={metrics.recentActivity} />
        </div>
      </div>
    </div>
  );
}
