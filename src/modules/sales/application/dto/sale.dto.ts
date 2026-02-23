import type { SaleStatus } from "../../domain/entities/sale.entity";

/**
 * API Response DTOs for Sales
 */

export interface SaleLineResponseDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  salePrice: number;
  currency: string;
  totalPrice: number;
}

/** Raw shape returned by list endpoint (no lines, no warehouseName) */
export interface SaleApiRawDto {
  id: string;
  saleNumber: string;
  status: SaleStatus;
  warehouseId: string;
  warehouseName?: string;
  customerReference: string | null;
  externalReference?: string | null;
  note: string | null;
  totalAmount: number;
  currency: string;
  lines?: SaleLineResponseDto[];
  movementId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  confirmedAt: string | null;
  confirmedBy?: string | null;
  confirmedByName?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  cancelledByName?: string | null;
}

export interface SaleResponseDto {
  id: string;
  saleNumber: string;
  status: SaleStatus;
  warehouseId: string;
  warehouseName?: string;
  customerReference: string | null;
  externalReference?: string | null;
  note: string | null;
  totalAmount: number;
  currency: string;
  lines?: SaleLineResponseDto[];
  movementId: string | null;
  createdBy: string;
  createdAt: string;
  confirmedAt: string | null;
  confirmedBy?: string | null;
  confirmedByName?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  cancelledByName?: string | null;
}

export interface SaleListResponseDto {
  data: SaleApiRawDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateSaleLineDto {
  productId: string;
  quantity: number;
  salePrice: number;
  currency?: string;
}

export interface CreateSaleDto {
  warehouseId: string;
  customerReference?: string;
  externalReference?: string;
  note?: string;
  lines?: CreateSaleLineDto[];
}

export interface UpdateSaleDto {
  customerReference?: string;
  externalReference?: string;
  note?: string;
}

export interface SaleFilters {
  warehouseId?: string;
  status?: SaleStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: "saleNumber" | "status" | "createdAt" | "confirmedAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
