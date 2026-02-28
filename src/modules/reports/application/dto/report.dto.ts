export type ReportTypeValue =
  | "AVAILABLE_INVENTORY"
  | "MOVEMENT_HISTORY"
  | "VALUATION"
  | "LOW_STOCK"
  | "MOVEMENTS"
  | "FINANCIAL"
  | "TURNOVER"
  | "SALES"
  | "SALES_BY_PRODUCT"
  | "SALES_BY_WAREHOUSE"
  | "RETURNS"
  | "RETURNS_BY_TYPE"
  | "RETURNS_BY_PRODUCT"
  | "RETURNS_CUSTOMER"
  | "RETURNS_SUPPLIER"
  | "ABC_ANALYSIS"
  | "DEAD_STOCK";

export type ReportFormatValue = "PDF" | "EXCEL" | "CSV";
export type GroupByValue =
  | "DAY"
  | "WEEK"
  | "MONTH"
  | "PRODUCT"
  | "WAREHOUSE"
  | "CUSTOMER"
  | "TYPE";
export type PeriodValue = "MONTHLY" | "QUARTERLY" | "YEARLY";
export type SeverityValue = "CRITICAL" | "WARNING";
export type MovementTypeValue =
  | "IN"
  | "OUT"
  | "ADJUSTMENT"
  | "TRANSFER_IN"
  | "TRANSFER_OUT";

export interface ReportDateRange {
  startDate?: string;
  endDate?: string;
}

export interface ReportParameters {
  dateRange?: ReportDateRange;
  warehouseIds?: string[];
  productId?: string;
  categoryIds?: string[];
  status?: string[];
  returnTypes?: ("CUSTOMER" | "SUPPLIER")[];
  groupBy?: GroupByValue;
  period?: PeriodValue;
  movementTypes?: MovementTypeValue[];
  customerReference?: string;
  saleId?: string;
  movementId?: string;
  includeInactive?: boolean;
  locationId?: string;
  severities?: SeverityValue[];
  deadStockDays?: number;
}

export interface ReportColumn {
  key: string;
  header: string;
  type: "string" | "number" | "date" | "currency" | "percentage" | "boolean";
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface ReportMetadataDto {
  reportType: ReportTypeValue;
  reportTitle: string;
  generatedAt: string;
  totalRecords: number;
  parameters?: ReportParameters;
  orgId?: string;
}

export interface ReportViewResponseDto {
  success: boolean;
  message: string;
  data: {
    columns: ReportColumn[];
    rows: Record<string, unknown>[];
    metadata: ReportMetadataDto;
    summary?: Record<string, number | string>;
  };
  timestamp: string;
  fromCache?: boolean;
}

export interface ExportOptionsDto {
  includeHeader?: boolean;
  includeSummary?: boolean;
  title?: string;
  author?: string;
}

export interface ReportResult {
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  metadata: ReportMetadataDto;
  summary?: Record<string, number | string>;
  fromCache?: boolean;
}

export interface ReportCategoryConfig {
  key: string;
  types: ReportTypeValue[];
}

export interface ReportTypeConfig {
  type: ReportTypeValue;
  category: string;
  filters: {
    dateRange?: boolean;
    warehouseIds?: boolean;
    categoryIds?: boolean;
    period?: boolean;
    groupBy?: boolean;
    status?: boolean;
    returnTypes?: boolean;
    severities?: boolean;
    movementTypes?: boolean;
    includeInactive?: boolean;
    deadStockDays?: boolean;
  };
}

export const REPORT_CATEGORIES: ReportCategoryConfig[] = [
  {
    key: "inventory",
    types: [
      "AVAILABLE_INVENTORY",
      "MOVEMENT_HISTORY",
      "VALUATION",
      "LOW_STOCK",
      "MOVEMENTS",
      "FINANCIAL",
      "TURNOVER",
      "ABC_ANALYSIS",
      "DEAD_STOCK",
    ],
  },
  {
    key: "sales",
    types: ["SALES", "SALES_BY_PRODUCT", "SALES_BY_WAREHOUSE"],
  },
  {
    key: "returns",
    types: [
      "RETURNS",
      "RETURNS_BY_TYPE",
      "RETURNS_BY_PRODUCT",
      "RETURNS_CUSTOMER",
      "RETURNS_SUPPLIER",
    ],
  },
];

export const REPORT_FILTER_CONFIG: Record<
  ReportTypeValue,
  ReportTypeConfig["filters"]
> = {
  AVAILABLE_INVENTORY: {
    warehouseIds: true,
    includeInactive: true,
  },
  MOVEMENT_HISTORY: {
    dateRange: true,
    warehouseIds: true,
    movementTypes: true,
  },
  VALUATION: { warehouseIds: true, categoryIds: true },
  LOW_STOCK: { warehouseIds: true, severities: true },
  MOVEMENTS: {
    dateRange: true,
    warehouseIds: true,
    movementTypes: true,
  },
  FINANCIAL: {
    dateRange: true,
    warehouseIds: true,
    categoryIds: true,
  },
  TURNOVER: {
    dateRange: true,
    warehouseIds: true,
    categoryIds: true,
  },
  SALES: {
    dateRange: true,
    warehouseIds: true,
    status: true,
  },
  SALES_BY_PRODUCT: {
    dateRange: true,
    warehouseIds: true,
    categoryIds: true,
  },
  SALES_BY_WAREHOUSE: { dateRange: true, warehouseIds: true },
  RETURNS: {
    dateRange: true,
    warehouseIds: true,
    status: true,
    returnTypes: true,
  },
  RETURNS_BY_TYPE: { dateRange: true, warehouseIds: true, returnTypes: true },
  RETURNS_BY_PRODUCT: {
    dateRange: true,
    warehouseIds: true,
    categoryIds: true,
    returnTypes: true,
  },
  RETURNS_CUSTOMER: { dateRange: true, warehouseIds: true, status: true },
  RETURNS_SUPPLIER: { dateRange: true, warehouseIds: true, status: true },
  ABC_ANALYSIS: {
    dateRange: true,
    warehouseIds: true,
    categoryIds: true,
  },
  DEAD_STOCK: {
    warehouseIds: true,
    categoryIds: true,
    deadStockDays: true,
    includeInactive: true,
  },
};

export const REPORT_PATHS: Record<ReportTypeValue, string> = {
  AVAILABLE_INVENTORY: "/reports/inventory/available",
  MOVEMENT_HISTORY: "/reports/inventory/movement-history",
  VALUATION: "/reports/inventory/valuation",
  LOW_STOCK: "/reports/inventory/low-stock",
  MOVEMENTS: "/reports/inventory/movements",
  FINANCIAL: "/reports/inventory/financial",
  TURNOVER: "/reports/inventory/turnover",
  SALES: "/reports/sales",
  SALES_BY_PRODUCT: "/reports/sales/by-product",
  SALES_BY_WAREHOUSE: "/reports/sales/by-warehouse",
  RETURNS: "/reports/returns",
  RETURNS_BY_TYPE: "/reports/returns/by-type",
  RETURNS_BY_PRODUCT: "/reports/returns/by-product",
  RETURNS_CUSTOMER: "/reports/returns/customer",
  RETURNS_SUPPLIER: "/reports/returns/supplier",
  ABC_ANALYSIS: "/reports/inventory/abc-analysis",
  DEAD_STOCK: "/reports/inventory/dead-stock",
};
