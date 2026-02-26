import { apiClient } from "@/shared/infrastructure/http";
import type {
  DashboardMetricsDto,
  InventoryAvailableResponseDto,
  LowStockResponseDto,
  SalesReportResponseDto,
} from "@/modules/dashboard/application/dto/metrics.dto";

/**
 * Dashboard API Service
 * Uses centralized axios HTTP client with interceptors for auth
 */
export class DashboardApiService {
  private getMonthDateRange(): { startDate: string; endDate: string } {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      startDate: startOfMonth.toISOString().split("T")[0],
      endDate: endOfMonth.toISOString().split("T")[0],
    };
  }

  async getMetrics(): Promise<DashboardMetricsDto> {
    const { startDate, endDate } = this.getMonthDateRange();

    const [inventoryResponse, lowStockResponse, salesResponse] =
      await Promise.all([
        apiClient.get<InventoryAvailableResponseDto>(
          "/reports/inventory/available/view",
        ),
        apiClient.get<LowStockResponseDto>("/reports/inventory/low-stock/view"),
        apiClient.get<SalesReportResponseDto>("/reports/sales/view", {
          params: {
            "dateRange[startDate]": startDate,
            "dateRange[endDate]": endDate,
          },
        }),
      ]);

    const inventoryData = inventoryResponse.data;
    const lowStockData = lowStockResponse.data;
    const salesData = salesResponse.data;

    // Calculate sales totals from rows
    const salesRows = salesData.data.rows || [];
    const monthlyRevenue = salesRows.reduce(
      (sum: number, row: Record<string, unknown>) =>
        sum + (Number(row.totalAmount) || 0),
      0,
    );

    // Extract currency from first row or default to USD
    const inventoryRows = inventoryData.data.rows || [];
    const detectedCurrency = (inventoryRows[0]?.currency as string) || "USD";

    return {
      inventory: {
        totalProducts:
          inventoryData.data.summary?.totalItems ??
          inventoryData.data.metadata.totalRecords,
        totalValue: inventoryData.data.summary?.totalValue ?? 0,
        totalQuantity: inventoryData.data.summary?.totalQuantity ?? 0,
        currency: detectedCurrency,
      },
      lowStock: {
        criticalCount: lowStockData.data.metadata.totalRecords,
      },
      sales: {
        monthlyTotal: salesData.data.metadata.totalRecords,
        monthlyRevenue,
      },
    };
  }
}

export const dashboardApiService = new DashboardApiService();
