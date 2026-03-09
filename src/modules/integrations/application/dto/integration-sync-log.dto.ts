import type { SyncAction } from "@/modules/integrations/domain/entities/integration-sync-log.entity";

export interface IntegrationSyncLogResponseDto {
  id: string;
  connectionId: string;
  externalOrderId: string;
  action: SyncAction;
  saleId?: string | null;
  contactId?: string | null;
  errorMessage?: string | null;
  processedAt: string;
}

export interface IntegrationSyncLogListResponseDto {
  success: boolean;
  message: string;
  data: IntegrationSyncLogResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

export interface SyncLogFilters {
  action?: SyncAction;
  page?: number;
  limit?: number;
}
