/**
 * API Response DTOs for dashboard metrics
 */

export interface ReportMetadata {
  reportType: string;
  reportTitle: string;
  generatedAt: string;
  totalRecords: number;
  parameters?: Record<string, unknown>;
}

export interface InventoryAvailableResponseDto {
  data: {
    columns: Array<{ key: string; header: string; type: string }>;
    rows: Array<Record<string, unknown>>;
    metadata: ReportMetadata;
    summary: {
      totalItems: number;
      totalValue: number;
      totalQuantity: number;
    };
  };
}

export interface LowStockResponseDto {
  data: {
    columns: Array<{ key: string; header: string; type: string }>;
    rows: Array<Record<string, unknown>>;
    metadata: ReportMetadata;
  };
}

export interface SalesReportResponseDto {
  data: {
    columns: Array<{ key: string; header: string; type: string }>;
    rows: Array<Record<string, unknown>>;
    metadata: ReportMetadata;
  };
}

/**
 * Internal DTO for dashboard metrics
 */
export interface DashboardMetricsDto {
  inventory: {
    totalProducts: number;
    totalValue: number;
    totalQuantity: number;
    currency: string;
  };
  lowStock: {
    criticalCount: number;
  };
  sales: {
    monthlyTotal: number;
    monthlyRevenue: number;
  };
}
