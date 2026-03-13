import type { ImportFilters } from "@/modules/imports/application/dto/import.dto";

export const importKeys = {
  all: ["imports"] as const,
  lists: () => [...importKeys.all, "list"] as const,
  list: (filters?: ImportFilters) => [...importKeys.lists(), filters] as const,
  statuses: () => [...importKeys.all, "status"] as const,
  status: (id: string) => [...importKeys.statuses(), id] as const,
};
