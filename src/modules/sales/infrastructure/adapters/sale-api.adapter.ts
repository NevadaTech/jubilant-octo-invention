import { apiClient } from "@/shared/infrastructure/http";
import type { Sale } from "../../domain/entities/sale.entity";
import type {
  SaleRepositoryPort,
  PaginatedResult,
} from "../../application/ports/sale.repository.port";
import type {
  SaleListResponseDto,
  SaleResponseDto,
  CreateSaleDto,
  CreateSaleLineDto,
  ShipSaleDto,
  UpdateSaleDto,
  SaleFilters,
} from "../../application/dto/sale.dto";
import { SaleMapper } from "../../application/mappers/sale.mapper";
import type { ReturnApiRawDto } from "@/modules/returns/application/dto/return.dto";
import { ReturnMapper } from "@/modules/returns/application/mappers/return.mapper";
import type { Return } from "@/modules/returns/domain/entities/return.entity";

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

export class SaleApiAdapter implements SaleRepositoryPort {
  private readonly basePath = "/sales";

  async findAll(filters?: SaleFilters): Promise<PaginatedResult<Sale>> {
    const raw = await apiClient.get<SaleListResponseDto>(this.basePath, {
      params: this.buildQueryParams(filters),
    });

    const body = unwrapResponse(raw.data);

    return {
      data: (body.data ?? []).map(SaleMapper.fromApiRaw),
      pagination: body.pagination,
    };
  }

  async findById(id: string): Promise<Sale | null> {
    try {
      const raw = await apiClient.get<ApiResponse<SaleResponseDto>>(
        `${this.basePath}/${id}`,
      );
      const body = unwrapResponse(raw.data);
      return SaleMapper.toDomain(body.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async create(data: CreateSaleDto): Promise<Sale> {
    const raw = await apiClient.post<ApiResponse<SaleResponseDto>>(
      this.basePath,
      data,
    );
    const body = unwrapResponse(raw.data);
    return SaleMapper.toDomain(body.data);
  }

  async update(id: string, data: UpdateSaleDto): Promise<Sale> {
    const raw = await apiClient.patch<ApiResponse<SaleResponseDto>>(
      `${this.basePath}/${id}`,
      data,
    );
    const body = unwrapResponse(raw.data);
    return SaleMapper.toDomain(body.data);
  }

  async confirm(id: string): Promise<Sale> {
    const raw = await apiClient.post<ApiResponse<SaleResponseDto>>(
      `${this.basePath}/${id}/confirm`,
    );
    const body = unwrapResponse(raw.data);
    return SaleMapper.toDomain(body.data);
  }

  async cancel(id: string): Promise<Sale> {
    const raw = await apiClient.post<ApiResponse<SaleResponseDto>>(
      `${this.basePath}/${id}/cancel`,
    );
    const body = unwrapResponse(raw.data);
    return SaleMapper.toDomain(body.data);
  }

  async startPicking(id: string): Promise<Sale> {
    const raw = await apiClient.post<ApiResponse<SaleResponseDto>>(
      `${this.basePath}/${id}/pick`,
    );
    const body = unwrapResponse(raw.data);
    return SaleMapper.toDomain(body.data);
  }

  async ship(id: string, data: ShipSaleDto): Promise<Sale> {
    const raw = await apiClient.post<ApiResponse<SaleResponseDto>>(
      `${this.basePath}/${id}/ship`,
      data,
    );
    const body = unwrapResponse(raw.data);
    return SaleMapper.toDomain(body.data);
  }

  async complete(id: string): Promise<Sale> {
    const raw = await apiClient.post<ApiResponse<SaleResponseDto>>(
      `${this.basePath}/${id}/complete`,
    );
    const body = unwrapResponse(raw.data);
    return SaleMapper.toDomain(body.data);
  }

  async addLine(saleId: string, line: CreateSaleLineDto): Promise<Sale> {
    const raw = await apiClient.post<ApiResponse<SaleResponseDto>>(
      `${this.basePath}/${saleId}/lines`,
      line,
    );
    const body = unwrapResponse(raw.data);
    return SaleMapper.toDomain(body.data);
  }

  async removeLine(saleId: string, lineId: string): Promise<Sale> {
    const raw = await apiClient.delete<ApiResponse<SaleResponseDto>>(
      `${this.basePath}/${saleId}/lines/${lineId}`,
    );
    const body = unwrapResponse(raw.data);
    return SaleMapper.toDomain(body.data);
  }

  async getReturns(saleId: string): Promise<Return[]> {
    const raw = await apiClient.get<{ data: ReturnApiRawDto[] }>(
      `${this.basePath}/${saleId}/returns`,
    );
    const body = unwrapResponse(raw.data);
    return (body.data ?? []).map(ReturnMapper.fromApiRaw);
  }

  private buildQueryParams(filters?: SaleFilters): Record<string, unknown> {
    if (!filters) return {};

    const params: Record<string, unknown> = {};

    if (filters.warehouseId) params.warehouseId = filters.warehouseId;
    if (filters.status) params.status = filters.status;
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

export const saleApiAdapter = new SaleApiAdapter();
