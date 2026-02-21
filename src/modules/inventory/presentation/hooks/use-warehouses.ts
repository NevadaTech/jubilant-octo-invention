"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { warehouseApiAdapter } from "../../infrastructure/adapters/warehouse-api.adapter";
import type {
  WarehouseFilters,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from "../../application/dto";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const warehouseKeys = {
  all: ["warehouses"] as const,
  lists: () => [...warehouseKeys.all, "list"] as const,
  list: (filters?: WarehouseFilters) =>
    [...warehouseKeys.lists(), filters] as const,
  details: () => [...warehouseKeys.all, "detail"] as const,
  detail: (id: string) => [...warehouseKeys.details(), id] as const,
};

export function useWarehouses(filters?: WarehouseFilters) {
  return useQuery({
    queryKey: warehouseKeys.list(filters),
    queryFn: () => warehouseApiAdapter.findAll(filters),
    staleTime: STALE_TIME,
  });
}

export function useWarehouse(id: string) {
  return useQuery({
    queryKey: warehouseKeys.detail(id),
    queryFn: () => warehouseApiAdapter.findById(id),
    staleTime: STALE_TIME,
    enabled: Boolean(id),
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWarehouseDto) => warehouseApiAdapter.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWarehouseDto }) =>
      warehouseApiAdapter.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: warehouseKeys.detail(id) });
    },
  });
}

export function useToggleWarehouseStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      warehouseApiAdapter.update(id, { isActive }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: warehouseKeys.detail(id) });
    },
  });
}
