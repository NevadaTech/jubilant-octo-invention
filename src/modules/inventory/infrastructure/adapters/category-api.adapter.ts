import { apiClient } from "@/shared/infrastructure/http";
import type { Category } from "../../domain/entities/category.entity";
import type {
  CategoryRepositoryPort,
  PaginatedResult,
} from "../../application/ports/category.repository.port";
import type {
  CategoryListResponseDto,
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryFilters,
} from "../../application/dto/category.dto";
import { CategoryMapper } from "../../application/mappers/category.mapper";

interface ApiResponse<T> {
  data: T;
}

export class CategoryApiAdapter implements CategoryRepositoryPort {
  private readonly basePath = "/inventory/categories";

  async findAll(filters?: CategoryFilters): Promise<PaginatedResult<Category>> {
    const response = await apiClient.get<CategoryListResponseDto>(
      this.basePath,
      {
        params: this.buildQueryParams(filters),
      },
    );

    return {
      data: response.data.data.map(CategoryMapper.toDomain),
      pagination: response.data.pagination,
    };
  }

  async findById(id: string): Promise<Category | null> {
    try {
      const response = await apiClient.get<ApiResponse<CategoryResponseDto>>(
        `${this.basePath}/${id}`,
      );
      return CategoryMapper.toDomain(response.data.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async create(data: CreateCategoryDto): Promise<Category> {
    const response = await apiClient.post<ApiResponse<CategoryResponseDto>>(
      this.basePath,
      data,
    );
    return CategoryMapper.toDomain(response.data.data);
  }

  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    const response = await apiClient.put<ApiResponse<CategoryResponseDto>>(
      `${this.basePath}/${id}`,
      data,
    );
    return CategoryMapper.toDomain(response.data.data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  private buildQueryParams(filters?: CategoryFilters): Record<string, unknown> {
    if (!filters) return {};

    const params: Record<string, unknown> = {};

    if (filters.search) {
      params.search = filters.search;
    }
    if (filters.parentId) {
      params.parentId = filters.parentId;
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

export const categoryApiAdapter = new CategoryApiAdapter();
