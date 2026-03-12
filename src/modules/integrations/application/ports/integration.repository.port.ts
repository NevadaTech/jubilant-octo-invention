import type { IntegrationConnection } from "@/modules/integrations/domain/entities/integration-connection.entity";
import type { IntegrationSyncLog } from "@/modules/integrations/domain/entities/integration-sync-log.entity";
import type {
  CreateIntegrationConnectionDto,
  UpdateIntegrationConnectionDto,
  IntegrationConnectionFilters,
  TestConnectionResponseDto,
  TriggerSyncResponseDto,
  MeliAuthUrlResponseDto,
} from "@/modules/integrations/application/dto/integration-connection.dto";
import type { SyncLogFilters } from "@/modules/integrations/application/dto/integration-sync-log.dto";
import type {
  CreateSkuMappingDto,
  IntegrationSkuMappingResponseDto,
  UnmatchedSkuDto,
} from "@/modules/integrations/application/dto/integration-sku-mapping.dto";

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface IntegrationRepositoryPort {
  findAll(
    filters?: IntegrationConnectionFilters,
  ): Promise<IntegrationConnection[]>;
  findById(id: string): Promise<IntegrationConnection | null>;
  create(data: CreateIntegrationConnectionDto): Promise<IntegrationConnection>;
  update(
    id: string,
    data: UpdateIntegrationConnectionDto,
  ): Promise<IntegrationConnection>;
  delete(id: string): Promise<void>;
  testConnection(id: string): Promise<TestConnectionResponseDto>;
  triggerSync(id: string): Promise<TriggerSyncResponseDto>;
  getSyncLogs(
    id: string,
    filters?: SyncLogFilters,
  ): Promise<PaginatedResult<IntegrationSyncLog>>;
  getSkuMappings(
    connectionId: string,
  ): Promise<IntegrationSkuMappingResponseDto[]>;
  createSkuMapping(
    connectionId: string,
    data: CreateSkuMappingDto,
  ): Promise<IntegrationSkuMappingResponseDto>;
  deleteSkuMapping(connectionId: string, mappingId: string): Promise<void>;
  getUnmatchedSkus(connectionId: string): Promise<UnmatchedSkuDto[]>;
  retrySyncLog(connectionId: string, logId: string): Promise<void>;
  retryAllFailed(connectionId: string): Promise<void>;
  getMeliAuthUrl(
    connectionId: string,
    redirectUri: string,
  ): Promise<MeliAuthUrlResponseDto>;
}
