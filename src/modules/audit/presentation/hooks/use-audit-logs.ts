"use client";

import { useQuery } from "@tanstack/react-query";
import { auditLogApiAdapter } from "../../infrastructure/adapters/audit-log-api.adapter";
import type { AuditLogFilters } from "../../application/dto/audit-log.dto";

const auditLogKeys = {
  all: ["audit-logs"] as const,
  lists: () => [...auditLogKeys.all, "list"] as const,
  list: (filters?: AuditLogFilters) =>
    [...auditLogKeys.lists(), filters] as const,
  details: () => [...auditLogKeys.all, "detail"] as const,
  detail: (id: string) => [...auditLogKeys.details(), id] as const,
};

export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: auditLogKeys.list(filters),
    queryFn: () => auditLogApiAdapter.findAll(filters),
  });
}

export function useAuditLog(id: string) {
  return useQuery({
    queryKey: auditLogKeys.detail(id),
    queryFn: () => auditLogApiAdapter.findById(id),
    enabled: !!id,
  });
}
