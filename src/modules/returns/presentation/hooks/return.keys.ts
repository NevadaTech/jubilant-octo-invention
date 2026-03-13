import type { ReturnFilters } from "@/modules/returns/application/dto/return.dto";

export const returnKeys = {
  all: ["returns"] as const,
  lists: () => [...returnKeys.all, "list"] as const,
  list: (filters?: ReturnFilters) => [...returnKeys.lists(), filters] as const,
  details: () => [...returnKeys.all, "detail"] as const,
  detail: (id: string) => [...returnKeys.details(), id] as const,
};
