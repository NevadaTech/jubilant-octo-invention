import { apiClient } from "@/shared/infrastructure/http";
import type { Return } from "@/modules/returns/domain/entities/return.entity";
import type {
  ReturnRepositoryPort,
  PaginatedResult,
} from "@/modules/returns/application/ports/return.repository.port";
import type {
  ReturnListResponseDto,
  ReturnResponseDto,
  CreateReturnDto,
  CreateReturnLineDto,
  UpdateReturnDto,
  ReturnFilters,
} from "@/modules/returns/application/dto/return.dto";
import { ReturnMapper } from "@/modules/returns/application/mappers/return.mapper";

interface ApiResponse<T> {
  data: T;
}

export class ReturnApiAdapter implements ReturnRepositoryPort {
  private readonly basePath = "/returns";

  async findAll(filters?: ReturnFilters): Promise<PaginatedResult<Return>> {
    const raw = await apiClient.get<ReturnListResponseDto>(this.basePath, {
      params: this.buildQueryParams(filters),
    });

    const body = raw.data;

    return {
      data: (body.data ?? []).map(ReturnMapper.fromApiRaw),
      pagination: body.pagination,
    };
  }

  async findById(id: string): Promise<Return | null> {
    try {
      const raw = await apiClient.get<ApiResponse<ReturnResponseDto>>(
        `${this.basePath}/${id}`,
      );
      const body = raw.data;
      return ReturnMapper.toDomain(body.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async create(data: CreateReturnDto): Promise<Return> {
    const raw = await apiClient.post<ApiResponse<ReturnResponseDto>>(
      this.basePath,
      data,
    );
    const body = raw.data;
    return ReturnMapper.toDomain(body.data);
  }

  async update(id: string, data: UpdateReturnDto): Promise<Return> {
    const raw = await apiClient.put<ApiResponse<ReturnResponseDto>>(
      `${this.basePath}/${id}`,
      data,
    );
    const body = raw.data;
    return ReturnMapper.toDomain(body.data);
  }

  async confirm(id: string): Promise<Return> {
    const raw = await apiClient.post<ApiResponse<ReturnResponseDto>>(
      `${this.basePath}/${id}/confirm`,
    );
    const body = raw.data;
    return ReturnMapper.toDomain(body.data);
  }

  async cancel(id: string): Promise<Return> {
    const raw = await apiClient.post<ApiResponse<ReturnResponseDto>>(
      `${this.basePath}/${id}/cancel`,
    );
    const body = raw.data;
    return ReturnMapper.toDomain(body.data);
  }

  async addLine(returnId: string, line: CreateReturnLineDto): Promise<Return> {
    const raw = await apiClient.post<ApiResponse<ReturnResponseDto>>(
      `${this.basePath}/${returnId}/lines`,
      line,
    );
    const body = raw.data;
    return ReturnMapper.toDomain(body.data);
  }

  async removeLine(returnId: string, lineId: string): Promise<Return> {
    const raw = await apiClient.delete<ApiResponse<ReturnResponseDto>>(
      `${this.basePath}/${returnId}/lines/${lineId}`,
    );
    const body = raw.data;
    return ReturnMapper.toDomain(body.data);
  }

  private buildQueryParams(filters?: ReturnFilters): Record<string, unknown> {
    if (!filters) return {};

    const params: Record<string, unknown> = {};

    if (filters.warehouseIds?.length)
      params.warehouseId = filters.warehouseIds.join(",");
    if (filters.companyId) params.companyId = filters.companyId;
    if (filters.status?.length) params.status = filters.status.join(",");
    if (filters.types?.length) params.type = filters.types.join(",");
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.search) params.search = filters.search;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

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
