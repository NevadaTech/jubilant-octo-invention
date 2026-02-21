"use client";

import { useQuery } from "@tanstack/react-query";
import { stockApiAdapter } from "../../infrastructure/adapters/stock-api.adapter";
import type { StockFilters } from "../../application/dto";

const STALE_TIME = 2 * 60 * 1000; // 2 minutes (stock changes more frequently)

export const stockKeys = {
  all: ["stock"] as const,
  lists: () => [...stockKeys.all, "list"] as const,
  list: (filters?: StockFilters) => [...stockKeys.lists(), filters] as const,
  byLocation: () => [...stockKeys.all, "location"] as const,
  location: (productId: string, warehouseId: string) =>
    [...stockKeys.byLocation(), productId, warehouseId] as const,
};

export function useStock(filters?: StockFilters) {
  return useQuery({
    queryKey: stockKeys.list(filters),
    queryFn: () => stockApiAdapter.findAll(filters),
    staleTime: STALE_TIME,
  });
}

export function useStockByLocation(productId: string, warehouseId: string) {
  return useQuery({
    queryKey: stockKeys.location(productId, warehouseId),
    queryFn: () =>
      stockApiAdapter.findByProductAndWarehouse(productId, warehouseId),
    staleTime: STALE_TIME,
    enabled: Boolean(productId) && Boolean(warehouseId),
  });
}
