/**
 * API Response DTOs for Combos
 */

/** Item within a combo */
export interface ComboItemDto {
  id: string;
  productId: string;
  quantity: number;
}

/** Full combo response from the API */
export interface ComboResponseDto {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  isActive: boolean;
  orgId: string;
  items: ComboItemDto[];
  createdAt: string;
  updatedAt: string;
}

/** Paginated list response */
export interface ComboListResponseDto {
  data: ComboResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** What the backend accepts for CREATE */
export interface CreateComboDto {
  sku: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  items: { productId: string; quantity: number }[];
}

/** What the backend accepts for UPDATE */
export interface UpdateComboDto {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  items?: { productId: string; quantity: number }[];
}

/** Query params for listing combos */
export interface GetCombosQueryDto {
  page?: number;
  limit?: number;
  isActive?: boolean;
  name?: string;
  sku?: string;
}

/** Query params for combo availability */
export interface GetComboAvailabilityQueryDto {
  page?: number;
  limit?: number;
  isActive?: boolean;
  name?: string;
  sku?: string;
  warehouseId?: string;
}

/** Availability info per warehouse */
export interface ComboAvailabilityDto {
  id: string;
  sku: string;
  name: string;
  price: number;
  isActive: boolean;
  availability: {
    warehouseId: string;
    warehouseName: string;
    available: number;
  }[];
}

/** Query params for combo sales report */
export interface GetComboSalesReportQueryDto {
  dateFrom?: string;
  dateTo?: string;
  comboId?: string;
}

/** Single item in the combo sales report */
export interface ComboSalesReportItemDto {
  comboId: string;
  sku: string;
  name: string;
  totalComboUnitsSold: number;
  totalRevenue: number;
  salesCount: number;
}

/** Query params for combo stock impact */
export interface GetComboStockImpactQueryDto {
  dateFrom?: string;
  dateTo?: string;
}

/** Stock impact response for a product */
export interface ComboStockImpactDto {
  directSalesQty: number;
  comboSalesQty: number;
  totalQty: number;
  comboBreakdown: {
    comboId: string;
    sku: string;
    name: string;
    qty: number;
  }[];
}
