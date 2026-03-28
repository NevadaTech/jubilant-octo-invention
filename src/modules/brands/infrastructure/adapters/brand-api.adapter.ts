import { apiClient } from "@/shared/infrastructure/http";
import type { Brand } from "@/modules/brands/domain/entities/brand.entity";
import type {
  BrandRepositoryPort,
  PaginatedResult,
} from "@/modules/brands/application/ports/brand.repository.port";
import type {
  BrandListResponseDto,
  BrandResponseDto,
  CreateBrandDto,
  UpdateBrandDto,
  BrandFilters,
} from "@/modules/brands/application/dto/brand.dto";
import { BrandMapper } from "@/modules/brands/application/mappers/brand.mapper";

interface ApiResponse<T> {
  data: T;
}

export class BrandApiAdapter implements BrandRepositoryPort {
  private readonly basePath = "/inventory/brands";

  async findAll(filters?: BrandFilters): Promise<PaginatedResult<Brand>> {
    const response = await apiClient.get<BrandListResponseDto>(this.basePath, {
      params: this.buildQueryParams(filters),
    });

    return {
      data: response.data.data.map(BrandMapper.toDomain),
      pagination: response.data.pagination,
    };
  }

  async findById(id: string): Promise<Brand | null> {
    try {
      const response = await apiClient.get<ApiResponse<BrandResponseDto>>(
        `${this.basePath}/${id}`,
      );
      return BrandMapper.toDomain(response.data.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async create(data: CreateBrandDto): Promise<Brand> {
    const response = await apiClient.post<ApiResponse<BrandResponseDto>>(
      this.basePath,
      data,
    );
    return BrandMapper.toDomain(response.data.data);
  }

  async update(id: string, data: UpdateBrandDto): Promise<Brand> {
    const response = await apiClient.patch<ApiResponse<BrandResponseDto>>(
      `${this.basePath}/${id}`,
      data,
    );
    return BrandMapper.toDomain(response.data.data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.patch(`${this.basePath}/${id}/deactivate`);
  }

  private buildQueryParams(filters?: BrandFilters): Record<string, unknown> {
    if (!filters) return {};

    const params: Record<string, unknown> = {};

    if (filters.search) params.search = filters.search;
    if (filters.isActive !== undefined) params.isActive = filters.isActive;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

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
