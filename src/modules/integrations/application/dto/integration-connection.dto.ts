import type {
  IntegrationProvider,
  ConnectionStatus,
  SyncStrategy,
  SyncDirection,
} from "@/modules/integrations/domain/entities/integration-connection.entity";

export interface IntegrationConnectionResponseDto {
  id: string;
  provider: IntegrationProvider;
  accountName: string;
  storeName: string;
  status: ConnectionStatus;
  syncStrategy: SyncStrategy;
  syncDirection: SyncDirection;
  defaultWarehouseId: string;
  warehouseName?: string | null;
  defaultContactId?: string | null;
  defaultContactName?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  connectedAt?: string | null;
  lastSyncAt?: string | null;
  lastSyncError?: string | null;
  syncedOrdersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationConnectionListResponseDto {
  success: boolean;
  message: string;
  data: IntegrationConnectionResponseDto[];
  timestamp: string;
}

export interface IntegrationConnectionDetailResponseDto {
  success: boolean;
  message: string;
  data: IntegrationConnectionResponseDto;
  timestamp: string;
}

export interface CreateIntegrationConnectionDto {
  provider: IntegrationProvider;
  accountName: string;
  storeName: string;
  appKey: string;
  appToken: string;
  syncStrategy: SyncStrategy;
  syncDirection: SyncDirection;
  defaultWarehouseId: string;
  defaultContactId?: string;
  companyId?: string;
}

export interface UpdateIntegrationConnectionDto {
  storeName?: string;
  appKey?: string;
  appToken?: string;
  syncStrategy?: SyncStrategy;
  syncDirection?: SyncDirection;
  defaultWarehouseId?: string;
  defaultContactId?: string;
  companyId?: string;
}

export interface IntegrationConnectionFilters {
  provider?: IntegrationProvider;
  status?: ConnectionStatus;
}

export interface TestConnectionResponseDto {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface TriggerSyncResponseDto {
  success: boolean;
  message: string;
  timestamp: string;
}
