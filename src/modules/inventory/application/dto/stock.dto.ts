/**
 * API Response DTOs for Stock
 */

/** Actual shape from the stock API */
export interface StockApiRawDto {
  productId: string;
  warehouseId: string;
  quantity: number;
  averageCost: number;
  totalValue: number;
  currency: string;
  // Optional — may be included if the backend joins relations
  id?: string;
  productName?: string;
  productSku?: string;
  warehouseName?: string;
  reservedQuantity?: number;
  availableQuantity?: number;
  lastMovementAt?: string | null;
}

export interface StockResponseDto {
  id?: string;
  productId: string;
  productName?: string;
  productSku?: string;
  warehouseId: string;
  warehouseName?: string;
  quantity: number;
  reservedQuantity?: number;
  availableQuantity?: number;
  lastMovementAt?: string | null;
}

/** API list response wraps in { success, message, data } */
export interface StockListResponseDto {
  success?: boolean;
  message?: string;
  data: StockApiRawDto[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp?: string;
}

export interface StockFilters {
  productId?: string;
  warehouseIds?: string[];
  companyId?: string;
  search?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?:
    | "productName"
    | "warehouseName"
    | "quantity"
    | "averageCost"
    | "totalValue"
    | "lastMovementAt";
  sortOrder?: "asc" | "desc";
}
