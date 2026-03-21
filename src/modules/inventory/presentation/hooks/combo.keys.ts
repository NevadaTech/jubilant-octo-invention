import type {
  GetCombosQueryDto,
  GetComboAvailabilityQueryDto,
  GetComboSalesReportQueryDto,
  GetComboStockImpactQueryDto,
} from "@/modules/inventory/application/dto/combo.dto";

export const comboKeys = {
  all: ["combos"] as const,
  lists: () => [...comboKeys.all, "list"] as const,
  list: (filters?: GetCombosQueryDto) =>
    [...comboKeys.lists(), filters] as const,
  details: () => [...comboKeys.all, "detail"] as const,
  detail: (id: string) => [...comboKeys.details(), id] as const,
  availability: () => [...comboKeys.all, "availability"] as const,
  availabilityList: (filters?: GetComboAvailabilityQueryDto) =>
    [...comboKeys.availability(), filters] as const,
  salesReport: (filters?: GetComboSalesReportQueryDto) =>
    [...comboKeys.all, "salesReport", filters] as const,
  stockImpact: (productId: string, filters?: GetComboStockImpactQueryDto) =>
    [...comboKeys.all, "stockImpact", productId, filters] as const,
};
