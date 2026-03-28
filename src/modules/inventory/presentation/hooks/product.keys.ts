import type { ProductFilters } from "@/modules/inventory/application/dto";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters?: ProductFilters) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  lookups: () => [...productKeys.all, "lookup"] as const,
  lookup: (code: string) => [...productKeys.lookups(), code] as const,
};
