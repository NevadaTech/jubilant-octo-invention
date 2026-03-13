"use client";

import { useQuery } from "@tanstack/react-query";
import { getContainer } from "@/config/di/container";
import type { StockFilters } from "@/modules/inventory/application/dto";
import { stockKeys } from "./stock.keys";

export { stockKeys } from "./stock.keys";

const STALE_TIME = 2 * 60 * 1000; // 2 minutes (stock changes more frequently)

export function useStock(filters?: StockFilters) {
  return useQuery({
    queryKey: stockKeys.list(filters),
    queryFn: () => getContainer().stockRepository.findAll(filters),
    staleTime: STALE_TIME,
  });
}

export function useStockByLocation(productId: string, warehouseId: string) {
  return useQuery({
    queryKey: stockKeys.location(productId, warehouseId),
    queryFn: () =>
      getContainer().stockRepository.findByProductAndWarehouse(
        productId,
        warehouseId,
      ),
    staleTime: STALE_TIME,
    enabled: Boolean(productId) && Boolean(warehouseId),
  });
}
