import { apiClient } from "@/shared/infrastructure/http";
import type { IntegrationConnection } from "@/modules/integrations/domain/entities/integration-connection.entity";
import type { IntegrationSyncLog } from "@/modules/integrations/domain/entities/integration-sync-log.entity";
import type {
  IntegrationRepositoryPort,
  PaginatedResult,
} from "@/modules/integrations/application/ports/integration.repository.port";
import type {
  IntegrationConnectionListResponseDto,
  IntegrationConnectionDetailResponseDto,
  CreateIntegrationConnectionDto,
  UpdateIntegrationConnectionDto,
  IntegrationConnectionFilters,
  TestConnectionResponseDto,
  TriggerSyncResponseDto,
} from "@/modules/integrations/application/dto/integration-connection.dto";
import type {
  IntegrationSyncLogListResponseDto,
  SyncLogFilters,
} from "@/modules/integrations/application/dto/integration-sync-log.dto";
import type {
  IntegrationSkuMappingResponseDto,
  IntegrationSkuMappingListResponseDto,
  CreateSkuMappingDto,
  UnmatchedSkuDto,
  UnmatchedSkusResponseDto,
} from "@/modules/integrations/application/dto/integration-sku-mapping.dto";
import { IntegrationConnectionMapper } from "@/modules/integrations/application/mappers/integration-connection.mapper";
import { IntegrationSyncLogMapper } from "@/modules/integrations/application/mappers/integration-sync-log.mapper";

export class IntegrationApiAdapter implements IntegrationRepositoryPort {
  private readonly basePath = "/integrations";

  async findAll(
    filters?: IntegrationConnectionFilters,
  ): Promise<IntegrationConnection[]> {
    const params: Record<string, unknown> = {};
    if (filters?.provider) params.provider = filters.provider;
    if (filters?.status) params.status = filters.status;

    const response =
      await apiClient.get<IntegrationConnectionListResponseDto>(
        this.basePath,
        { params },
      );

    return response.data.data.map(IntegrationConnectionMapper.toDomain);
  }

  async findById(id: string): Promise<IntegrationConnection | null> {
    try {
      const response =
        await apiClient.get<IntegrationConnectionDetailResponseDto>(
          `${this.basePath}/${id}`,
        );
      return IntegrationConnectionMapper.toDomain(response.data.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async create(
    data: CreateIntegrationConnectionDto,
  ): Promise<IntegrationConnection> {
    const response =
      await apiClient.post<IntegrationConnectionDetailResponseDto>(
        this.basePath,
        data,
      );
    return IntegrationConnectionMapper.toDomain(response.data.data);
  }

  async update(
    id: string,
    data: UpdateIntegrationConnectionDto,
  ): Promise<IntegrationConnection> {
    const response =
      await apiClient.patch<IntegrationConnectionDetailResponseDto>(
        `${this.basePath}/${id}`,
        data,
      );
    return IntegrationConnectionMapper.toDomain(response.data.data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  async testConnection(id: string): Promise<TestConnectionResponseDto> {
    const response = await apiClient.post<TestConnectionResponseDto>(
      `${this.basePath}/${id}/test`,
    );
    return response.data;
  }

  async triggerSync(id: string): Promise<TriggerSyncResponseDto> {
    const response = await apiClient.post<TriggerSyncResponseDto>(
      `${this.basePath}/${id}/sync`,
    );
    return response.data;
  }

  async getSyncLogs(
    id: string,
    filters?: SyncLogFilters,
  ): Promise<PaginatedResult<IntegrationSyncLog>> {
    const params: Record<string, unknown> = {};
    if (filters?.action) params.action = filters.action;
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;

    const response =
      await apiClient.get<IntegrationSyncLogListResponseDto>(
        `${this.basePath}/${id}/logs`,
        { params },
      );

    return {
      data: response.data.data.map(IntegrationSyncLogMapper.toDomain),
      pagination: response.data.pagination,
    };
  }

  async getSkuMappings(
    connectionId: string,
  ): Promise<IntegrationSkuMappingResponseDto[]> {
    const response =
      await apiClient.get<IntegrationSkuMappingListResponseDto>(
        `${this.basePath}/${connectionId}/sku-mappings`,
      );
    return response.data.data;
  }

  async createSkuMapping(
    connectionId: string,
    data: CreateSkuMappingDto,
  ): Promise<IntegrationSkuMappingResponseDto> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: IntegrationSkuMappingResponseDto;
      timestamp: string;
    }>(`${this.basePath}/${connectionId}/sku-mappings`, data);
    return response.data.data;
  }

  async deleteSkuMapping(
    connectionId: string,
    mappingId: string,
  ): Promise<void> {
    await apiClient.delete(
      `${this.basePath}/${connectionId}/sku-mappings/${mappingId}`,
    );
  }

  async getUnmatchedSkus(connectionId: string): Promise<UnmatchedSkuDto[]> {
    const response = await apiClient.get<UnmatchedSkusResponseDto>(
      `${this.basePath}/${connectionId}/unmatched-skus`,
    );
    return response.data.data;
  }

  async retrySyncLog(connectionId: string, logId: string): Promise<void> {
    await apiClient.post(
      `${this.basePath}/${connectionId}/retry/${logId}`,
    );
  }

  async retryAllFailed(connectionId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/${connectionId}/retry-all`);
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
