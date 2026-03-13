import type { IntegrationConnectionFilters } from "@/modules/integrations/application/dto/integration-connection.dto";
import type { SyncLogFilters } from "@/modules/integrations/application/dto/integration-sync-log.dto";

export const integrationKeys = {
  all: ["integrations"] as const,
  lists: () => [...integrationKeys.all, "list"] as const,
  list: (filters?: IntegrationConnectionFilters) =>
    [...integrationKeys.lists(), filters] as const,
  details: () => [...integrationKeys.all, "detail"] as const,
  detail: (id: string) => [...integrationKeys.details(), id] as const,
  logs: (id: string) => [...integrationKeys.all, "logs", id] as const,
  logList: (id: string, filters?: SyncLogFilters) =>
    [...integrationKeys.logs(id), filters] as const,
  skuMappings: (id: string) =>
    [...integrationKeys.all, "sku-mappings", id] as const,
  unmatchedSkus: (id: string) =>
    [...integrationKeys.all, "unmatched-skus", id] as const,
  failedSyncs: (id: string) =>
    [...integrationKeys.all, "failed-syncs", id] as const,
};
