import { apiClient } from "@/shared/infrastructure/http";
import type { Combo } from "@/modules/inventory/domain/entities/combo.entity";
import type {
  ComboRepositoryPort,
  PaginatedResult,
} from "@/modules/inventory/application/ports/combo.repository.port";
import type {
  ComboResponseDto,
  ComboListResponseDto,
  CreateComboDto,
  UpdateComboDto,
  GetCombosQueryDto,
  GetComboAvailabilityQueryDto,
  ComboAvailabilityDto,
  GetComboSalesReportQueryDto,
  ComboSalesReportItemDto,
  GetComboStockImpactQueryDto,
  ComboStockImpactDto,
} from "@/modules/inventory/application/dto/combo.dto";
import { ComboMapper } from "@/modules/inventory/application/mappers/combo.mapper";

interface ApiResponse<T> {
  data: T;
}

export class ComboApiAdapter implements ComboRepositoryPort {
  private readonly basePath = "/inventory/combos";

  async findAll(query?: GetCombosQueryDto): Promise<PaginatedResult<Combo>> {
    const response = await apiClient.get<{
      data: ComboResponseDto[];
      pagination: ComboListResponseDto["pagination"];
    }>(this.basePath, {
      params: this.buildQueryParams(query),
    });

    return {
      data: response.data.data.map((dto) => ComboMapper.toDomain(dto)),
      pagination: response.data.pagination,
    };
  }

  async findById(id: string): Promise<Combo | null> {
    try {
      const response = await apiClient.get<ApiResponse<ComboResponseDto>>(
        `${this.basePath}/${id}`,
      );
      return ComboMapper.toDomain(response.data.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async create(dto: CreateComboDto): Promise<Combo> {
    const response = await apiClient.post<ApiResponse<ComboResponseDto>>(
      this.basePath,
      dto,
    );
    return ComboMapper.toDomain(response.data.data);
  }

  async update(id: string, dto: UpdateComboDto): Promise<Combo> {
    const response = await apiClient.put<ApiResponse<ComboResponseDto>>(
      `${this.basePath}/${id}`,
      dto,
    );
    return ComboMapper.toDomain(response.data.data);
  }

  async deactivate(id: string): Promise<Combo> {
    const response = await apiClient.patch<ApiResponse<ComboResponseDto>>(
      `${this.basePath}/${id}/deactivate`,
    );
    return ComboMapper.toDomain(response.data.data);
  }

  async getAvailability(
    query?: GetComboAvailabilityQueryDto,
  ): Promise<PaginatedResult<ComboAvailabilityDto>> {
    const response = await apiClient.get<{
      data: ComboAvailabilityDto[];
      pagination: ComboListResponseDto["pagination"];
    }>(`${this.basePath}/availability`, {
      params: this.buildAvailabilityParams(query),
    });

    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  }

  async getSalesReport(
    query?: GetComboSalesReportQueryDto,
  ): Promise<ComboSalesReportItemDto[]> {
    const params: Record<string, unknown> = {};
    if (query?.dateFrom) params.dateFrom = query.dateFrom;
    if (query?.dateTo) params.dateTo = query.dateTo;
    if (query?.comboId) params.comboId = query.comboId;

    const response = await apiClient.get<
      ApiResponse<ComboSalesReportItemDto[]>
    >(`${this.basePath}/sales-report`, { params });

    return response.data.data;
  }

  async getStockImpact(
    productId: string,
    query?: GetComboStockImpactQueryDto,
  ): Promise<ComboStockImpactDto> {
    const params: Record<string, unknown> = {};
    if (query?.dateFrom) params.dateFrom = query.dateFrom;
    if (query?.dateTo) params.dateTo = query.dateTo;

    const response = await apiClient.get<ApiResponse<ComboStockImpactDto>>(
      `${this.basePath}/stock-impact/${productId}`,
      { params },
    );

    return response.data.data;
  }

  private buildQueryParams(query?: GetCombosQueryDto): Record<string, unknown> {
    if (!query) return {};

    const params: Record<string, unknown> = {};

    if (query.page) params.page = query.page;
    if (query.limit) params.limit = query.limit;
    if (query.isActive !== undefined) params.isActive = query.isActive;
    if (query.name) params.name = query.name;
    if (query.sku) params.sku = query.sku;

    return params;
  }

  private buildAvailabilityParams(
    query?: GetComboAvailabilityQueryDto,
  ): Record<string, unknown> {
    if (!query) return {};

    const params: Record<string, unknown> = {};

    if (query.page) params.page = query.page;
    if (query.limit) params.limit = query.limit;
    if (query.isActive !== undefined) params.isActive = query.isActive;
    if (query.name) params.name = query.name;
    if (query.sku) params.sku = query.sku;
    if (query.warehouseId) params.warehouseId = query.warehouseId;

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
