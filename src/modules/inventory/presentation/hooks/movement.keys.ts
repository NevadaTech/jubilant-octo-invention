import type { StockMovementFilters } from "@/modules/inventory/application/dto/stock-movement.dto";

export const movementKeys = {
  all: ["movements"] as const,
  lists: () => [...movementKeys.all, "list"] as const,
  list: (filters?: StockMovementFilters) =>
    [...movementKeys.lists(), filters] as const,
  details: () => [...movementKeys.all, "detail"] as const,
  detail: (id: string) => [...movementKeys.details(), id] as const,
};
