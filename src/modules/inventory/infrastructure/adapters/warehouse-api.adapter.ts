import { apiClient } from "@/shared/infrastructure/http";
import type { Warehouse } from "../../domain/entities/warehouse.entity";
import type {
  WarehouseRepositoryPort,
  PaginatedResult,
} from "../../application/ports/warehouse.repository.port";
import type {
  WarehouseListResponseDto,
  WarehouseResponseDto,
  CreateWarehouseDto,
  UpdateWarehouseDto,
  WarehouseFilters,
} from "../../application/dto/warehouse.dto";
import { WarehouseMapper } from "../../application/mappers/warehouse.mapper";

interface ApiResponse<T> {
  data: T;
}

export class WarehouseApiAdapter implements WarehouseRepositoryPort {
  private readonly basePath = "/inventory/warehouses";

  async findAll(
    filters?: WarehouseFilters,
  ): Promise<PaginatedResult<Warehouse>> {
    const response = await apiClient.get<WarehouseListResponseDto>(
      this.basePath,
      {
        params: this.buildQueryParams(filters),
      },
    );

    return {
      data: response.data.data.map(WarehouseMapper.toDomain),
      pagination: response.data.pagination,
    };
  }

  async findById(id: string): Promise<Warehouse | null> {
    try {
      const response = await apiClient.get<ApiResponse<WarehouseResponseDto>>(
        `${this.basePath}/${id}`,
      );
      return WarehouseMapper.toDomain(response.data.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async create(data: CreateWarehouseDto): Promise<Warehouse> {
    const response = await apiClient.post<ApiResponse<WarehouseResponseDto>>(
      this.basePath,
      data,
    );
    return WarehouseMapper.toDomain(response.data.data);
  }

  async update(id: string, data: UpdateWarehouseDto): Promise<Warehouse> {
    const response = await apiClient.put<ApiResponse<WarehouseResponseDto>>(
      `${this.basePath}/${id}`,
      data,
    );
    return WarehouseMapper.toDomain(response.data.data);
  }

  private buildQueryParams(
    filters?: WarehouseFilters,
  ): Record<string, unknown> {
    if (!filters) return {};

    const params: Record<string, unknown> = {};

    if (filters.search) {
      params.search = filters.search;
    }
    if (filters.isActive !== undefined) {
      params.isActive = filters.isActive;
    }
    if (filters.page) {
      params.page = filters.page;
    }
    if (filters.limit) {
      params.limit = filters.limit;
    }

    return params;
  }

  private isNotFoundError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: { status?: number } }).response ===
        "object" &&
      (error as { response: { status?: number } }).response?.status === 404
    );
  }
}

export const warehouseApiAdapter = new WarehouseApiAdapter();
