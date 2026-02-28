import type { TransferStatus } from "@/modules/inventory/domain/entities/transfer.entity";

/**
 * API Response DTOs for Transfers
 */

export interface TransferLineResponseDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  receivedQuantity?: number | null;
  fromLocationId?: string;
  toLocationId?: string;
}

export interface ReceiveTransferLineDto {
  lineId: string;
  receivedQuantity: number;
}

export interface ReceiveTransferDto {
  lines: ReceiveTransferLineDto[];
}

/** Raw shape returned by GET /inventory/transfers (list) */
export interface TransferApiRawDto {
  id: string;
  fromWarehouseId: string;
  fromWarehouseName?: string;
  toWarehouseId: string;
  toWarehouseName?: string;
  status: TransferStatus;
  note: string | null;
  linesCount?: number;
  totalQuantity?: number;
  lines?: TransferLineResponseDto[];
  createdBy: string;
  receivedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface TransferResponseDto {
  id: string;
  fromWarehouseId: string;
  fromWarehouseName?: string;
  toWarehouseId: string;
  toWarehouseName?: string;
  status: TransferStatus;
  note?: string | null;
  lines?: TransferLineResponseDto[];
  linesCount: number;
  createdBy: string;
  receivedBy?: string | null;
  orgId?: string;
  initiatedAt?: string | null;
  receivedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

/** Shape returned by GET /inventory/transfers/:id */
export interface TransferDetailApiResponse {
  success: boolean;
  message: string;
  data: TransferResponseDto;
  timestamp: string;
}

export interface TransferListResponseDto {
  data: TransferApiRawDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateTransferLineDto {
  productId: string;
  quantity: number;
}

export interface CreateTransferDto {
  fromWarehouseId: string;
  toWarehouseId: string;
  note?: string;
  lines: CreateTransferLineDto[];
}

export interface UpdateTransferStatusDto {
  status: TransferStatus;
}

export interface TransferFilters {
  fromWarehouseIds?: string[];
  toWarehouseIds?: string[];
  status?: TransferStatus[];
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "status" | "createdAt" | "initiatedAt" | "receivedAt";
  sortOrder?: "asc" | "desc";
}
