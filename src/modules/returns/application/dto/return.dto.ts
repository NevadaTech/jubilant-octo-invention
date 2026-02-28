import type {
  ReturnStatus,
  ReturnType,
} from "@/modules/returns/domain/entities/return.entity";

export interface ReturnLineResponseDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  originalSalePrice: number | null;
  originalUnitCost: number | null;
  currency: string;
  totalPrice: number;
}

/** Raw line shape from API (may lack productName, productSku, originalUnitCost) */
export interface ReturnLineApiRawDto {
  id: string;
  productId: string;
  productName?: string;
  productSku?: string;
  quantity: number;
  originalSalePrice: number | null;
  originalUnitCost?: number | null;
  currency: string;
  totalPrice: number;
}

/** Raw shape returned by the API (may lack warehouseName, saleNumber, etc.) */
export interface ReturnApiRawDto {
  id: string;
  returnNumber: string;
  status: ReturnStatus;
  type: ReturnType;
  reason?: string | null;
  warehouseId: string;
  warehouseName?: string;
  saleId?: string | null;
  saleNumber?: string | null;
  sourceMovementId?: string | null;
  returnMovementId?: string | null;
  note?: string | null;
  totalAmount: number;
  currency: string;
  lines?: ReturnLineApiRawDto[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
}

export interface ReturnResponseDto {
  id: string;
  returnNumber: string;
  status: ReturnStatus;
  type: ReturnType;
  reason: string | null;
  warehouseId: string;
  warehouseName?: string;
  saleId: string | null;
  saleNumber?: string | null;
  sourceMovementId?: string | null;
  returnMovementId?: string | null;
  note: string | null;
  totalAmount: number;
  currency: string;
  lines?: ReturnLineResponseDto[];
  createdBy: string;
  createdAt: string;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
}

export interface ReturnListResponseDto {
  success?: boolean;
  message?: string;
  data: ReturnApiRawDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateReturnLineDto {
  productId: string;
  quantity: number;
  originalSalePrice?: number;
  originalUnitCost?: number;
  currency?: string;
}

export interface CreateReturnDto {
  type: ReturnType;
  warehouseId: string;
  saleId?: string;
  sourceMovementId?: string;
  reason?: string;
  note?: string;
  lines?: CreateReturnLineDto[];
}

export interface UpdateReturnDto {
  reason?: string;
  note?: string;
}

export interface ReturnFilters {
  warehouseId?: string;
  status?: ReturnStatus;
  type?: ReturnType;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?:
    | "returnNumber"
    | "type"
    | "status"
    | "total"
    | "warehouseName"
    | "items"
    | "createdAt"
    | "confirmedAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
