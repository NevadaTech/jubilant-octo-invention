import { apiClient } from "@/shared/infrastructure/http";
import type { StockMovement } from "@/modules/inventory/domain/entities/stock-movement.entity";
import type {
  StockMovementRepositoryPort,
  PaginatedResult,
} from "@/modules/inventory/application/ports/stock-movement.repository.port";
import type {
  StockMovementListResponseDto,
  StockMovementResponseDto,
  CreateStockMovementDto,
  UpdateStockMovementDto,
  StockMovementFilters,
} from "@/modules/inventory/application/dto/stock-movement.dto";
import { StockMovementMapper } from "@/modules/inventory/application/mappers/stock-movement.mapper";

interface ApiResponse<T> {
  data: T;
}

export class StockMovementApiAdapter implements StockMovementRepositoryPort {
  private readonly basePath = "/inventory/movements";

  async findAll(
    filters?: StockMovementFilters,
  ): Promise<PaginatedResult<StockMovement>> {
    const response = await apiClient.get<StockMovementListResponseDto>(
      this.basePath,
      {
        params: this.buildQueryParams(filters),
      },
    );

    return {
      data: response.data.data.map(StockMovementMapper.toDomain),
      pagination: response.data.pagination,
    };
  }

  async findById(id: string): Promise<StockMovement | null> {
    try {
      const response = await apiClient.get<
        ApiResponse<StockMovementResponseDto>
      >(`${this.basePath}/${id}`);
      return StockMovementMapper.toDomain(response.data.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async create(data: CreateStockMovementDto): Promise<StockMovement> {
    const response = await apiClient.post<
      ApiResponse<StockMovementResponseDto>
    >(this.basePath, data);
    return StockMovementMapper.toDomain(response.data.data);
  }

  async update(
    id: string,
    data: UpdateStockMovementDto,
  ): Promise<StockMovement> {
    const response = await apiClient.patch<
      ApiResponse<StockMovementResponseDto>
    >(`${this.basePath}/${id}`, data);
    return StockMovementMapper.toDomain(response.data.data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  async post(id: string): Promise<void> {
    await apiClient.post(`${this.basePath}/${id}/post`);
  }

  async void(id: string): Promise<void> {
    await apiClient.post(`${this.basePath}/${id}/void`);
  }

  private buildQueryParams(
    filters?: StockMovementFilters,
  ): Record<string, unknown> {
    if (!filters) return {};

    const params: Record<string, unknown> = {};

    if (filters.warehouseIds?.length) {
      params.warehouseId = filters.warehouseIds.join(",");
    }
    if (filters.companyId) {
      params.companyId = filters.companyId;
    }
    if (filters.types?.length) {
      params.type = filters.types.join(",");
    }
    if (filters.status?.length) {
      params.status = filters.status.join(",");
    }
    if (filters.productId) {
      params.productId = filters.productId;
    }
    if (filters.startDate) {
      params.startDate = filters.startDate;
    }
    if (filters.endDate) {
      params.endDate = filters.endDate;
    }
    if (filters.search) {
      params.search = filters.search;
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
