import { apiClient } from "@/shared/infrastructure/http";
import type { Company } from "@/modules/companies/domain/entities/company.entity";
import type {
  CompanyRepositoryPort,
  PaginatedResult,
} from "@/modules/companies/application/ports/company.repository.port";
import type {
  CompanyListResponseDto,
  CompanyResponseDto,
  CreateCompanyDto,
  UpdateCompanyDto,
  CompanyFilters,
} from "@/modules/companies/application/dto/company.dto";
import { CompanyMapper } from "@/modules/companies/application/mappers/company.mapper";

interface ApiResponse<T> {
  data: T;
}

export class CompanyApiAdapter implements CompanyRepositoryPort {
  private readonly basePath = "/inventory/companies";

  async findAll(filters?: CompanyFilters): Promise<PaginatedResult<Company>> {
    const response = await apiClient.get<CompanyListResponseDto>(
      this.basePath,
      {
        params: this.buildQueryParams(filters),
      },
    );

    return {
      data: response.data.data.map(CompanyMapper.toDomain),
      pagination: response.data.pagination,
    };
  }

  async findById(id: string): Promise<Company | null> {
    try {
      const response = await apiClient.get<ApiResponse<CompanyResponseDto>>(
        `${this.basePath}/${id}`,
      );
      return CompanyMapper.toDomain(response.data.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async create(data: CreateCompanyDto): Promise<Company> {
    const response = await apiClient.post<ApiResponse<CompanyResponseDto>>(
      this.basePath,
      data,
    );
    return CompanyMapper.toDomain(response.data.data);
  }

  async update(id: string, data: UpdateCompanyDto): Promise<Company> {
    const response = await apiClient.put<ApiResponse<CompanyResponseDto>>(
      `${this.basePath}/${id}`,
      data,
    );
    return CompanyMapper.toDomain(response.data.data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  private buildQueryParams(filters?: CompanyFilters): Record<string, unknown> {
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
