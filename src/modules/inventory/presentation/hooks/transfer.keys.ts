import type { TransferFilters } from "@/modules/inventory/application/dto/transfer.dto";

export const transferKeys = {
  all: ["transfers"] as const,
  lists: () => [...transferKeys.all, "list"] as const,
  list: (filters?: TransferFilters) =>
    [...transferKeys.lists(), filters] as const,
  details: () => [...transferKeys.all, "detail"] as const,
  detail: (id: string) => [...transferKeys.details(), id] as const,
};
