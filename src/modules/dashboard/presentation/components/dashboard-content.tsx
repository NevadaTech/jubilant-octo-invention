"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { useDashboardMetrics } from "@/modules/dashboard/presentation/hooks/use-dashboard-metrics";
import { useOrgSettings } from "@/shared/presentation/hooks/use-org-settings";
import { DashboardMetricsGrid } from "./dashboard-metrics-grid";
import { StatCardSkeleton } from "./stat-card-skeleton";
import { ChartSkeleton } from "./chart-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Button } from "@/ui/components/button";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";

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
const StockByCompanyChart = dynamic(
  () => import("./stock-by-company-chart").then((m) => m.StockByCompanyChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
const RecentActivityFeed = dynamic(
  () => import("./recent-activity-feed").then((m) => m.RecentActivityFeed),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
const TopCombosTable = dynamic(
  () => import("./top-combos-table").then((m) => m.TopCombosTable),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export function DashboardContent() {
  const t = useTranslations("dashboard.metrics");
  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);
  const { multiCompanyEnabled } = useOrgSettings();
  const showStockByCompany = multiCompanyEnabled && !selectedCompanyId;
  const { metrics, isLoading, isError, refetch } =
    useDashboardMetrics(selectedCompanyId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        {showStockByCompany ? (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
            <ChartSkeleton />
          </>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        )}
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
    <div className="space-y-4">
      <DashboardMetricsGrid metrics={metrics} />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <RecentActivityFeed
          data={metrics.recentActivity}
          lowStockCount={metrics.lowStock.count}
          combosOutOfStock={metrics.combos?.combosWithZeroAvailability ?? 0}
        />
        <SalesTrendChart
          data={metrics.salesTrend}
          currency={metrics.sales.currency}
        />
      </div>

      {showStockByCompany && metrics.stockByCompany ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <StockByCompanyChart
              data={metrics.stockByCompany}
              currency={metrics.inventory.currency}
            />
            <TopProductsChart
              data={metrics.topProducts}
              currency={metrics.sales.currency}
            />
          </div>
          <StockDistributionChart
            data={metrics.stockByWarehouse}
            currency={metrics.inventory.currency}
          />
        </>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <TopProductsChart
            data={metrics.topProducts}
            currency={metrics.sales.currency}
          />
          <StockDistributionChart
            data={metrics.stockByWarehouse}
            currency={metrics.inventory.currency}
          />
        </div>
      )}

      {metrics.combos?.topCombos && metrics.combos.topCombos.length > 0 && (
        <TopCombosTable
          data={metrics.combos.topCombos}
          currency={metrics.sales.currency}
        />
      )}
    </div>
  );
}
