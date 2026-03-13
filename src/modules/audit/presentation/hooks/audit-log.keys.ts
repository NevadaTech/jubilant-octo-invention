import type { AuditLogFilters } from "@/modules/audit/application/dto/audit-log.dto";

export const auditLogKeys = {
  all: ["audit-logs"] as const,
  lists: () => [...auditLogKeys.all, "list"] as const,
  list: (filters?: AuditLogFilters) =>
    [...auditLogKeys.lists(), filters] as const,
  details: () => [...auditLogKeys.all, "detail"] as const,
  detail: (id: string) => [...auditLogKeys.details(), id] as const,
};
