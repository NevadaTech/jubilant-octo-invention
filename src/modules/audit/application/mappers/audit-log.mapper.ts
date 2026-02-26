import { AuditLog } from "@/modules/audit/domain/entities/audit-log.entity";
import type { AuditLogResponseDto } from "@/modules/audit/application/dto/audit-log.dto";

export class AuditLogMapper {
  static toDomain(dto: AuditLogResponseDto): AuditLog {
    return AuditLog.create({
      id: dto.id,
      orgId: dto.orgId,
      entityType: dto.entityType,
      entityId: dto.entityId,
      action: dto.action,
      performedBy: dto.performedBy,
      metadata: dto.metadata ?? {},
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      httpMethod: dto.httpMethod,
      httpUrl: dto.httpUrl,
      httpStatusCode: dto.httpStatusCode,
      duration: dto.duration,
      createdAt: new Date(dto.createdAt),
    });
  }
}
