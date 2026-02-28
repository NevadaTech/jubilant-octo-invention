/**
 * API Response DTOs for Warehouses
 */

export interface WarehouseResponseDto {
  id: string;
  code: string;
  name: string;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  statusChangedBy?: string | null;
  statusChangedAt?: string | null;
}

export interface WarehouseListResponseDto {
  data: WarehouseResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateWarehouseDto {
  code: string;
  name: string;
  address?: string;
}

export interface UpdateWarehouseDto {
  code?: string;
  name?: string;
  address?: string;
  isActive?: boolean;
}

export interface WarehouseFilters {
  search?: string;
  statuses?: string[];
  page?: number;
  limit?: number;
  sortBy?: "name" | "code" | "isActive" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}
