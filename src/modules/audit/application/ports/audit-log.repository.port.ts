import type { AuditLog } from "../../domain/entities/audit-log.entity";
import type { AuditLogFilters } from "../dto/audit-log.dto";

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

export interface AuditLogRepositoryPort {
  findAll(filters?: AuditLogFilters): Promise<PaginatedResult<AuditLog>>;
  findById(id: string): Promise<AuditLog | null>;
}
