import type { WarehouseFilters } from "@/modules/inventory/application/dto";

export const warehouseKeys = {
  all: ["warehouses"] as const,
  lists: () => [...warehouseKeys.all, "list"] as const,
  list: (filters?: WarehouseFilters) =>
    [...warehouseKeys.lists(), filters] as const,
  details: () => [...warehouseKeys.all, "detail"] as const,
  detail: (id: string) => [...warehouseKeys.details(), id] as const,
};
