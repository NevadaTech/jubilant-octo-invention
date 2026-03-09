import { IntegrationConnection } from "@/modules/integrations/domain/entities/integration-connection.entity";
import type { IntegrationConnectionResponseDto } from "@/modules/integrations/application/dto/integration-connection.dto";
import type {
  IntegrationProvider,
  ConnectionStatus,
  SyncStrategy,
  SyncDirection,
} from "@/modules/integrations/domain/entities/integration-connection.entity";

export class IntegrationConnectionMapper {
  static toDomain(
    dto: IntegrationConnectionResponseDto,
  ): IntegrationConnection {
    return IntegrationConnection.create({
      id: dto.id,
      provider: dto.provider as IntegrationProvider,
      accountName: dto.accountName,
      storeName: dto.storeName,
      status: dto.status as ConnectionStatus,
      syncStrategy: dto.syncStrategy as SyncStrategy,
      syncDirection: dto.syncDirection as SyncDirection,
      defaultWarehouseId: dto.defaultWarehouseId,
      warehouseName: dto.warehouseName ?? null,
      defaultContactId: dto.defaultContactId ?? null,
      defaultContactName: dto.defaultContactName ?? null,
      companyId: dto.companyId ?? null,
      companyName: dto.companyName ?? null,
      connectedAt: dto.connectedAt ? new Date(dto.connectedAt) : null,
      lastSyncAt: dto.lastSyncAt ? new Date(dto.lastSyncAt) : null,
      lastSyncError: dto.lastSyncError ?? null,
      syncedOrdersCount: dto.syncedOrdersCount ?? 0,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    });
  }
}
