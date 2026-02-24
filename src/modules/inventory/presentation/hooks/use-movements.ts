"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { stockMovementApiAdapter } from "../../infrastructure/adapters/stock-movement-api.adapter";
import type {
  StockMovementFilters,
  CreateStockMovementDto,
  UpdateStockMovementDto,
} from "../../application/dto/stock-movement.dto";
import { stockKeys } from "./use-stock";

const STALE_TIME = 2 * 60 * 1000; // 2 minutes

export const movementKeys = {
  all: ["movements"] as const,
  lists: () => [...movementKeys.all, "list"] as const,
  list: (filters?: StockMovementFilters) =>
    [...movementKeys.lists(), filters] as const,
  details: () => [...movementKeys.all, "detail"] as const,
  detail: (id: string) => [...movementKeys.details(), id] as const,
};

export function useMovements(filters?: StockMovementFilters) {
  return useQuery({
    queryKey: movementKeys.list(filters),
    queryFn: () => stockMovementApiAdapter.findAll(filters),
    staleTime: STALE_TIME,
  });
}

export function useMovement(id: string) {
  return useQuery({
    queryKey: movementKeys.detail(id),
    queryFn: () => stockMovementApiAdapter.findById(id),
    staleTime: STALE_TIME,
    enabled: Boolean(id),
  });
}

export function useCreateMovement() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.movements");

  return useMutation({
    mutationFn: (data: CreateStockMovementDto) =>
      stockMovementApiAdapter.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movementKeys.lists() });
      toast.success(t("messages.created"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useUpdateMovement() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.movements");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStockMovementDto }) =>
      stockMovementApiAdapter.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: movementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: movementKeys.detail(id) });
      toast.success(t("messages.updated"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useDeleteMovement() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.movements");

  return useMutation({
    mutationFn: (id: string) => stockMovementApiAdapter.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movementKeys.lists() });
      toast.success(t("messages.deleted"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function usePostMovement() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.movements");

  return useMutation({
    mutationFn: (id: string) => stockMovementApiAdapter.post(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: movementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: movementKeys.detail(id) });
      // Also invalidate stock queries since posting affects stock levels
      queryClient.invalidateQueries({ queryKey: stockKeys.lists() });
      toast.success(t("messages.posted"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useVoidMovement() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.movements");

  return useMutation({
    mutationFn: (id: string) => stockMovementApiAdapter.void(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: movementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: movementKeys.detail(id) });
      // Also invalidate stock queries since voiding reverses stock changes
      queryClient.invalidateQueries({ queryKey: stockKeys.lists() });
      toast.success(t("messages.voided"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}
