import type { SaleFilters } from "@/modules/sales/application/dto/sale.dto";

export const saleKeys = {
  all: ["sales"] as const,
  lists: () => [...saleKeys.all, "list"] as const,
  list: (filters?: SaleFilters) => [...saleKeys.lists(), filters] as const,
  details: () => [...saleKeys.all, "detail"] as const,
  detail: (id: string) => [...saleKeys.details(), id] as const,
  returns: (id: string) => [...saleKeys.all, "returns", id] as const,
  swaps: (id: string) => [...saleKeys.all, "swaps", id] as const,
};
