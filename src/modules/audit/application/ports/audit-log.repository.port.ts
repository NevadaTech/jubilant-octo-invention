import type { PaginatedResult } from "@/shared/application/dto/pagination.dto";
import type { AuditLog } from "@/modules/audit/domain/entities/audit-log.entity";
import type { AuditLogFilters } from "@/modules/audit/application/dto/audit-log.dto";

export type { PaginatedResult };

export interface AuditLogRepositoryPort {
  findAll(filters?: AuditLogFilters): Promise<PaginatedResult<AuditLog>>;
  findById(id: string): Promise<AuditLog | null>;
}
