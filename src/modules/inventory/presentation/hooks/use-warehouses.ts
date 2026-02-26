"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import type {
  WarehouseFilters,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from "@/modules/inventory/application/dto";

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
    queryFn: () => getContainer().warehouseRepository.findAll(filters),
    staleTime: STALE_TIME,
  });
}

export function useWarehouse(id: string) {
  return useQuery({
    queryKey: warehouseKeys.detail(id),
    queryFn: () => getContainer().warehouseRepository.findById(id),
    staleTime: STALE_TIME,
    enabled: Boolean(id),
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.warehouses");

  return useMutation({
    mutationFn: (data: CreateWarehouseDto) =>
      getContainer().warehouseRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      toast.success(t("messages.created"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.warehouses");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWarehouseDto }) =>
      getContainer().warehouseRepository.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: warehouseKeys.detail(id) });
      toast.success(t("messages.updated"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useToggleWarehouseStatus() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.warehouses");

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      getContainer().warehouseRepository.update(id, { isActive }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: warehouseKeys.detail(id) });
      toast.success(t("messages.updated"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}
