import { apiClient } from "@/shared/infrastructure/http";
import type { Stock } from "@/modules/inventory/domain/entities/stock.entity";
import type {
  StockRepositoryPort,
  PaginatedResult,
} from "@/modules/inventory/application/ports/stock.repository.port";
import type {
  StockListResponseDto,
  StockResponseDto,
  StockFilters,
} from "@/modules/inventory/application/dto/stock.dto";
import { StockMapper } from "@/modules/inventory/application/mappers/stock.mapper";

interface ApiResponse<T> {
  data: T;
}

export class StockApiAdapter implements StockRepositoryPort {
  private readonly basePath = "/inventory/stock";

  async findAll(filters?: StockFilters): Promise<PaginatedResult<Stock>> {
    const response = await apiClient.get<StockListResponseDto>(this.basePath, {
      params: this.buildQueryParams(filters),
    });

    const body = response.data;
    const items = body.data ?? [];

    return {
      data: items.map((item, index) => StockMapper.toDomain(item, index)),
      pagination: body.pagination ?? {
        page: filters?.page ?? 1,
        limit: filters?.limit ?? 20,
        total: items.length,
        totalPages: 1,
      },
    };
  }

  async findByProductAndWarehouse(
    productId: string,
    warehouseId: string,
  ): Promise<Stock | null> {
    try {
      const response = await apiClient.get<ApiResponse<StockResponseDto>>(
        `${this.basePath}/product/${productId}/warehouse/${warehouseId}`,
      );
      return StockMapper.toDomain(response.data.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  private buildQueryParams(filters?: StockFilters): Record<string, unknown> {
    if (!filters) return {};

    const params: Record<string, unknown> = {};

    if (filters.productId) {
      params.productId = filters.productId;
    }
    if (filters.warehouseIds?.length) {
      params.warehouseId = filters.warehouseIds.join(",");
    }
    if (filters.companyId) {
      params.companyId = filters.companyId;
    }
    if (filters.search) {
      params.search = filters.search;
    }
    if (filters.lowStock !== undefined) {
      params.lowStock = filters.lowStock;
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
