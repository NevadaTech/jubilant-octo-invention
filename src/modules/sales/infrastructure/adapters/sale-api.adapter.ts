import { apiClient } from "@/shared/infrastructure/http";
import type { Sale } from "@/modules/sales/domain/entities/sale.entity";
import type {
  SaleRepositoryPort,
  PaginatedResult,
} from "@/modules/sales/application/ports/sale.repository.port";
import type {
  SaleListResponseDto,
  SaleResponseDto,
  CreateSaleDto,
  CreateSaleLineDto,
  ShipSaleDto,
  SwapSaleLineDto,
  SwapSaleLineResponseData,
  SwapHistoryItem,
  UpdateSaleDto,
  SaleFilters,
} from "@/modules/sales/application/dto/sale.dto";
import { SaleMapper } from "@/modules/sales/application/mappers/sale.mapper";
import type { SaleReturnSummary } from "@/modules/sales/application/ports/sale.repository.port";

interface ApiResponse<T> {
  data: T;
}

export class SaleApiAdapter implements SaleRepositoryPort {
  private readonly basePath = "/sales";

  async findAll(filters?: SaleFilters): Promise<PaginatedResult<Sale>> {
    const raw = await apiClient.get<SaleListResponseDto>(this.basePath, {
      params: this.buildQueryParams(filters),
    });

    const body = raw.data;

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
      const body = raw.data;
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
    const body = raw.data;
    return SaleMapper.toDomain(body.data);
  }

  async update(id: string, data: UpdateSaleDto): Promise<Sale> {
    const raw = await apiClient.patch<ApiResponse<SaleResponseDto>>(
      `${this.basePath}/${id}`,
      data,
    );
    const body = raw.data;
    return SaleMapper.toDomain(body.data);
  }

  async confirm(id: string): Promise<Sale> {
    const raw = await apiClient.post<ApiResponse<SaleResponseDto>>(
      `${this.basePath}/${id}/confirm`,
    );
    const body = raw.data;
    return SaleMapper.toDomain(body.data);
  }

  async cancel(id: string): Promise<Sale> {
    const raw = await apiClient.post<ApiResponse<SaleResponseDto>>(
      `${this.basePath}/${id}/cancel`,
    );
    const body = raw.data;
    return SaleMapper.toDomain(body.data);
  }

  async startPicking(id: string): Promise<Sale> {
    const raw = await apiClient.post<ApiResponse<SaleResponseDto>>(
      `${this.basePath}/${id}/pick`,
    );
    const body = raw.data;
    return SaleMapper.toDomain(body.data);
  }

  async ship(id: string, data: ShipSaleDto): Promise<Sale> {
    const raw = await apiClient.post<ApiResponse<SaleResponseDto>>(
      `${this.basePath}/${id}/ship`,
      data,
    );
    const body = raw.data;
    return SaleMapper.toDomain(body.data);
  }

  async complete(id: string): Promise<Sale> {
    const raw = await apiClient.post<ApiResponse<SaleResponseDto>>(
      `${this.basePath}/${id}/complete`,
    );
    const body = raw.data;
    return SaleMapper.toDomain(body.data);
  }

  async addLine(saleId: string, line: CreateSaleLineDto): Promise<Sale> {
    const raw = await apiClient.post<ApiResponse<SaleResponseDto>>(
      `${this.basePath}/${saleId}/lines`,
      line,
    );
    const body = raw.data;
    return SaleMapper.toDomain(body.data);
  }

  async removeLine(saleId: string, lineId: string): Promise<Sale> {
    const raw = await apiClient.delete<ApiResponse<SaleResponseDto>>(
      `${this.basePath}/${saleId}/lines/${lineId}`,
    );
    const body = raw.data;
    return SaleMapper.toDomain(body.data);
  }

  async getReturns(saleId: string): Promise<SaleReturnSummary[]> {
    interface ReturnLineRawDto {
      productId: string;
      quantity: number;
    }
    interface ReturnRawDto {
      id: string;
      returnNumber: string;
      status: string;
      type: string;
      totalAmount: number;
      currency: string;
      createdAt: string;
      lines?: ReturnLineRawDto[];
    }
    const raw = await apiClient.get<{ data: ReturnRawDto[] }>(
      `${this.basePath}/${saleId}/returns`,
    );
    const body = raw.data;
    return (body.data ?? []).map((r) => ({
      id: r.id,
      returnNumber: r.returnNumber,
      status: r.status,
      type: r.type,
      totalAmount: r.totalAmount,
      currency: r.currency,
      createdAt: new Date(r.createdAt),
      lines: (r.lines ?? []).map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
      })),
    }));
  }

  async swapLine(
    saleId: string,
    data: SwapSaleLineDto,
  ): Promise<SwapSaleLineResponseData> {
    const raw = await apiClient.post<{
      success: boolean;
      data: SwapSaleLineResponseData;
    }>(`${this.basePath}/${saleId}/swap`, data);
    return raw.data.data;
  }

  async getSwapHistory(saleId: string): Promise<SwapHistoryItem[]> {
    const raw = await apiClient.get<{
      success: boolean;
      data: SwapHistoryItem[];
    }>(`${this.basePath}/${saleId}/swaps`);
    return raw.data.data;
  }

  private buildQueryParams(filters?: SaleFilters): Record<string, unknown> {
    if (!filters) return {};

    const params: Record<string, unknown> = {};

    if (filters.warehouseIds?.length)
      params.warehouseId = filters.warehouseIds.join(",");
    if (filters.companyId) params.companyId = filters.companyId;
    if (filters.status?.length) params.status = filters.status.join(",");
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
