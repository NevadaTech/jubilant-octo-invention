import { apiClient } from "@/shared/infrastructure/http";
import type {
  Transfer,
  TransferStatus,
} from "@/modules/inventory/domain/entities/transfer.entity";
import type {
  TransferRepositoryPort,
  PaginatedResult,
} from "@/modules/inventory/application/ports/transfer.repository.port";
import type {
  TransferListResponseDto,
  TransferDetailApiResponse,
  TransferResponseDto,
  CreateTransferDto,
  ReceiveTransferDto,
  TransferFilters,
} from "@/modules/inventory/application/dto/transfer.dto";
import { TransferMapper } from "@/modules/inventory/application/mappers/transfer.mapper";

interface ApiResponse<T> {
  data: T;
}

export class TransferApiAdapter implements TransferRepositoryPort {
  private readonly basePath = "/inventory/transfers";

  async findAll(filters?: TransferFilters): Promise<PaginatedResult<Transfer>> {
    const response = await apiClient.get<TransferListResponseDto>(
      this.basePath,
      {
        params: this.buildQueryParams(filters),
      },
    );

    return {
      data: (response.data.data ?? []).map(TransferMapper.fromApiRaw),
      pagination: response.data.pagination,
    };
  }

  async findById(id: string): Promise<Transfer | null> {
    try {
      const response = await apiClient.get<TransferDetailApiResponse>(
        `${this.basePath}/${id}`,
      );
      return TransferMapper.toDomain(response.data.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async create(data: CreateTransferDto): Promise<Transfer> {
    const response = await apiClient.post<ApiResponse<TransferResponseDto>>(
      this.basePath,
      data,
    );
    return TransferMapper.toDomain(response.data.data);
  }

  async updateStatus(id: string, status: TransferStatus): Promise<Transfer> {
    const endpointMap: Partial<Record<TransferStatus, string>> = {
      IN_TRANSIT: "confirm",
      REJECTED: "reject",
      CANCELED: "cancel",
    };

    const endpoint = endpointMap[status];
    if (!endpoint) {
      throw new Error(`No endpoint defined for status transition: ${status}`);
    }

    const response = await apiClient.post<ApiResponse<TransferResponseDto>>(
      `${this.basePath}/${id}/${endpoint}`,
    );
    return TransferMapper.toDomain(response.data.data);
  }

  async receive(id: string, data: ReceiveTransferDto): Promise<Transfer> {
    const response = await apiClient.post<ApiResponse<TransferResponseDto>>(
      `${this.basePath}/${id}/receive`,
      data,
    );
    return TransferMapper.toDomain(response.data.data);
  }

  private buildQueryParams(filters?: TransferFilters): Record<string, unknown> {
    if (!filters) return {};

    const params: Record<string, unknown> = {};

    if (filters.fromWarehouseIds?.length) {
      params.fromWarehouseId = filters.fromWarehouseIds.join(",");
    }
    if (filters.toWarehouseIds?.length) {
      params.toWarehouseId = filters.toWarehouseIds.join(",");
    }
    if (filters.status?.length) {
      params.status = filters.status.join(",");
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
