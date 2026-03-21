import type { SaleStatus } from "@/modules/sales/domain/entities/sale.entity";

/**
 * API Response DTOs for Sales
 */

export interface SaleLineResponseDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productBarcode?: string | null;
  comboId?: string | null;
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
  contactId?: string | null;
  contactName?: string | null;
  customerReference: string | null;
  externalReference?: string | null;
  note: string | null;
  totalAmount: number;
  currency: string;
  lines?: SaleLineResponseDto[];
  movementId: string | null;
  createdBy: string;
  createdByName?: string | null;
  createdAt: string;
  updatedAt?: string;
  confirmedAt: string | null;
  confirmedBy?: string | null;
  confirmedByName?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  cancelledByName?: string | null;
  pickedAt?: string | null;
  pickedBy?: string | null;
  pickedByName?: string | null;
  shippedAt?: string | null;
  shippedBy?: string | null;
  shippedByName?: string | null;
  trackingNumber?: string | null;
  shippingCarrier?: string | null;
  shippingNotes?: string | null;
  completedAt?: string | null;
  completedBy?: string | null;
  completedByName?: string | null;
  returnedAt?: string | null;
  returnedBy?: string | null;
  returnedByName?: string | null;
  pickingEnabled?: boolean;
}

export interface SaleResponseDto {
  id: string;
  saleNumber: string;
  status: SaleStatus;
  warehouseId: string;
  warehouseName?: string;
  contactId?: string | null;
  contactName?: string | null;
  customerReference: string | null;
  externalReference?: string | null;
  note: string | null;
  totalAmount: number;
  currency: string;
  lines?: SaleLineResponseDto[];
  movementId: string | null;
  createdBy: string;
  createdByName?: string | null;
  createdAt: string;
  confirmedAt: string | null;
  confirmedBy?: string | null;
  confirmedByName?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  cancelledByName?: string | null;
  pickedAt?: string | null;
  pickedBy?: string | null;
  pickedByName?: string | null;
  shippedAt?: string | null;
  shippedBy?: string | null;
  shippedByName?: string | null;
  trackingNumber?: string | null;
  shippingCarrier?: string | null;
  shippingNotes?: string | null;
  completedAt?: string | null;
  completedBy?: string | null;
  completedByName?: string | null;
  returnedAt?: string | null;
  returnedBy?: string | null;
  returnedByName?: string | null;
  pickingEnabled?: boolean;
}

export interface ShipSaleDto {
  trackingNumber?: string;
  shippingCarrier?: string;
  shippingNotes?: string;
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
  productId?: string;
  comboId?: string;
  quantity: number;
  salePrice: number;
  currency?: string;
}

export interface CreateSaleDto {
  warehouseId: string;
  contactId: string;
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

export interface SwapSaleLineDto {
  lineId: string;
  replacementProductId: string;
  swapQuantity: number;
  sourceWarehouseId: string;
  pricingStrategy: "KEEP_ORIGINAL" | "NEW_PRICE";
  newSalePrice?: number;
  currency?: string;
  reason?: string;
}

export interface SwapSaleLineResponseData {
  swapId: string;
  saleId: string;
  originalProductId: string;
  replacementProductId: string;
  swapQuantity: number;
  originalSalePrice: number;
  replacementSalePrice: number;
  pricingStrategy: string;
  isCrossWarehouse: boolean;
  returnMovementId: string;
  deductMovementId: string;
  newLineId?: string;
  isPartial: boolean;
}

export interface SwapHistoryItem {
  id: string;
  saleId: string;
  originalLineId: string;
  newLineId: string | null;
  originalProductId: string;
  originalProductName: string;
  originalProductSku: string;
  replacementProductId: string;
  replacementProductName: string;
  replacementProductSku: string;
  originalQuantity: number;
  replacementQuantity: number;
  originalSalePrice: number;
  replacementSalePrice: number;
  originalCurrency: string;
  replacementCurrency: string;
  pricingStrategy: string;
  isCrossWarehouse: boolean;
  reason: string | null;
  performedBy: string;
  performedByName: string;
  createdAt: string;
}

export interface SaleFilters {
  warehouseIds?: string[];
  companyId?: string;
  status?: SaleStatus[];
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?:
    | "saleNumber"
    | "status"
    | "total"
    | "warehouseName"
    | "customerReference"
    | "items"
    | "createdAt"
    | "confirmedAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
