"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import { getApiErrorMessage } from "@/shared/presentation/utils/get-api-error-message";
import type {
  WarehouseFilters,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from "@/modules/inventory/application/dto";
import { warehouseKeys } from "./warehouse.keys";

export { warehouseKeys } from "./warehouse.keys";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

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
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (data: CreateWarehouseDto) =>
      getContainer().warehouseRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      toast.success(t("messages.created"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.warehouses");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWarehouseDto }) =>
      getContainer().warehouseRepository.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: warehouseKeys.detail(id) });
      toast.success(t("messages.updated"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useToggleWarehouseStatus() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.warehouses");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      getContainer().warehouseRepository.update(id, { isActive }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: warehouseKeys.detail(id) });
      toast.success(t("messages.updated"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}
