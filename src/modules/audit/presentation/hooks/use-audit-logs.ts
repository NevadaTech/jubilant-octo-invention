"use client";

import { useQuery } from "@tanstack/react-query";
import { getContainer } from "@/config/di/container";
import type { AuditLogFilters } from "@/modules/audit/application/dto/audit-log.dto";
import { auditLogKeys } from "./audit-log.keys";

export { auditLogKeys } from "./audit-log.keys";

export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: auditLogKeys.list(filters),
    queryFn: () => getContainer().auditLogRepository.findAll(filters),
  });
}

export function useAuditLog(id: string) {
  return useQuery({
    queryKey: auditLogKeys.detail(id),
    queryFn: () => getContainer().auditLogRepository.findById(id),
    enabled: !!id,
  });
}
