import type {
  MovementType,
  MovementStatus,
} from "@/modules/inventory/domain/entities/stock-movement.entity";

/**
 * API Response DTOs for Stock Movements
 */

export interface MovementLineResponseDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitCost: number | null;
  currency?: string | null;
}

export interface StockMovementResponseDto {
  id: string;
  warehouseId: string;
  warehouseName?: string;
  warehouseCode?: string;
  type: MovementType;
  status: MovementStatus;
  reference: string | null;
  reason: string | null;
  note: string | null;
  lines: MovementLineResponseDto[];
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  postedAt: string | null;
  postedBy?: string | null;
  postedByName?: string;
  returnedAt?: string | null;
  returnedBy?: string | null;
  returnedByName?: string;
}

export interface StockMovementListResponseDto {
  data: StockMovementResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateMovementLineDto {
  productId: string;
  quantity: number;
  unitCost?: number;
}

export interface CreateStockMovementDto {
  warehouseId: string;
  type: MovementType;
  reference?: string;
  reason?: string;
  note?: string;
  lines: CreateMovementLineDto[];
}

export interface UpdateStockMovementDto {
  warehouseId?: string;
  type?: MovementType;
  reference?: string;
  reason?: string;
  note?: string;
  lines?: CreateMovementLineDto[];
}

export interface StockMovementFilters {
  warehouseIds?: string[];
  companyId?: string;
  types?: MovementType[];
  status?: MovementStatus[];
  productId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "type" | "status" | "createdAt" | "postedAt";
  sortOrder?: "asc" | "desc";
}
