import type { StockFilters } from "@/modules/inventory/application/dto";

export const stockKeys = {
  all: ["stock"] as const,
  lists: () => [...stockKeys.all, "list"] as const,
  list: (filters?: StockFilters) => [...stockKeys.lists(), filters] as const,
  byLocation: () => [...stockKeys.all, "location"] as const,
  location: (productId: string, warehouseId: string) =>
    [...stockKeys.byLocation(), productId, warehouseId] as const,
};
