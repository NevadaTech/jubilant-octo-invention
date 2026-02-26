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

/** Unwrap Effect-style { _tag, _value } if present */
function unwrapResponse<T>(data: T): T {
  if (data && typeof data === "object" && "_tag" in data && "_value" in data) {
    return (data as unknown as { _value: T })._value;
  }
  return data;
}

export class ReturnApiAdapter implements ReturnRepositoryPort {
  private readonly basePath = "/returns";

  async findAll(filters?: ReturnFilters): Promise<PaginatedResult<Return>> {
    const raw = await apiClient.get<ReturnListResponseDto>(this.basePath, {
      params: this.buildQueryParams(filters),
    });

    const body = unwrapResponse(raw.data);

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
      const body = unwrapResponse(raw.data);
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
    const body = unwrapResponse(raw.data);
    return ReturnMapper.toDomain(body.data);
  }

  async update(id: string, data: UpdateReturnDto): Promise<Return> {
    const raw = await apiClient.put<ApiResponse<ReturnResponseDto>>(
      `${this.basePath}/${id}`,
      data,
    );
    const body = unwrapResponse(raw.data);
    return ReturnMapper.toDomain(body.data);
  }

  async confirm(id: string): Promise<Return> {
    const raw = await apiClient.post<ApiResponse<ReturnResponseDto>>(
      `${this.basePath}/${id}/confirm`,
    );
    const body = unwrapResponse(raw.data);
    return ReturnMapper.toDomain(body.data);
  }

  async cancel(id: string): Promise<Return> {
    const raw = await apiClient.post<ApiResponse<ReturnResponseDto>>(
      `${this.basePath}/${id}/cancel`,
    );
    const body = unwrapResponse(raw.data);
    return ReturnMapper.toDomain(body.data);
  }

  async addLine(returnId: string, line: CreateReturnLineDto): Promise<Return> {
    const raw = await apiClient.post<ApiResponse<ReturnResponseDto>>(
      `${this.basePath}/${returnId}/lines`,
      line,
    );
    const body = unwrapResponse(raw.data);
    return ReturnMapper.toDomain(body.data);
  }

  async removeLine(returnId: string, lineId: string): Promise<Return> {
    const raw = await apiClient.delete<ApiResponse<ReturnResponseDto>>(
      `${this.basePath}/${returnId}/lines/${lineId}`,
    );
    const body = unwrapResponse(raw.data);
    return ReturnMapper.toDomain(body.data);
  }

  private buildQueryParams(filters?: ReturnFilters): Record<string, unknown> {
    if (!filters) return {};

    const params: Record<string, unknown> = {};

    if (filters.warehouseId) params.warehouseId = filters.warehouseId;
    if (filters.status) params.status = filters.status;
    if (filters.type) params.type = filters.type;
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
