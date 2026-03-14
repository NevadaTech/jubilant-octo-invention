import type { SyncAction } from "@/modules/integrations/domain/entities/integration-sync-log.entity";

export interface SyncLogOrderItemDto {
  name: string;
  sku: string | null;
  quantity: number;
  price: number;
}

export interface IntegrationSyncLogResponseDto {
  id: string;
  connectionId: string;
  externalOrderId: string;
  action: SyncAction;
  externalOrderStatus?: string | null;
  saleId?: string | null;
  saleNumber?: string | null;
  contactId?: string | null;
  contactName?: string | null;
  errorMessage?: string | null;
  externalOrderDate?: string | null;
  orderItems?: SyncLogOrderItemDto[];
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
  };
  timestamp: string;
}

export interface SyncLogFilters {
  action?: SyncAction;
  page?: number;
  limit?: number;
}
