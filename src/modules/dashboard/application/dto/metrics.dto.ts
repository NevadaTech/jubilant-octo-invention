/**
 * Dashboard metrics DTO — matches backend GET /dashboard/metrics response
 */
export interface DashboardMetricsDto {
  inventory: {
    totalProducts: number;
    totalStockQuantity: number;
    totalInventoryValue: number;
    currency: string;
  };
  lowStock: {
    count: number;
  };
  sales: {
    monthlyCount: number;
    monthlyRevenue: number;
    currency: string;
  };
  salesTrend: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
  topProducts: Array<{
    name: string;
    sku: string;
    revenue: number;
    quantitySold: number;
  }>;
  stockByWarehouse: Array<{
    warehouseName: string;
    quantity: number;
    value: number;
  }>;
  recentActivity: Array<{
    type: string;
    reference: string;
    status: string;
    description: string;
    createdAt: string;
  }>;
}

/**
 * Backend response wrapper for dashboard metrics
 */
export interface DashboardMetricsApiResponse {
  success: boolean;
  message: string;
  data: DashboardMetricsDto;
  timestamp: string;
}
