import { IntegrationSyncLog } from "@/modules/integrations/domain/entities/integration-sync-log.entity";
import type { IntegrationSyncLogResponseDto } from "@/modules/integrations/application/dto/integration-sync-log.dto";
import type { SyncAction } from "@/modules/integrations/domain/entities/integration-sync-log.entity";

export class IntegrationSyncLogMapper {
  static toDomain(dto: IntegrationSyncLogResponseDto): IntegrationSyncLog {
    return IntegrationSyncLog.create({
      id: dto.id,
      connectionId: dto.connectionId,
      externalOrderId: dto.externalOrderId,
      action: dto.action as SyncAction,
      saleId: dto.saleId ?? null,
      saleNumber: dto.saleNumber ?? null,
      contactId: dto.contactId ?? null,
      errorMessage: dto.errorMessage ?? null,
      rawPayload: null,
      processedAt: new Date(dto.processedAt),
    });
  }
}
