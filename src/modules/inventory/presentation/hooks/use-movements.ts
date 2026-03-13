"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import { getApiErrorMessage } from "@/shared/presentation/utils/get-api-error-message";
import type {
  StockMovementFilters,
  CreateStockMovementDto,
  UpdateStockMovementDto,
} from "@/modules/inventory/application/dto/stock-movement.dto";
import { stockKeys } from "./stock.keys";
import { movementKeys } from "./movement.keys";

export { movementKeys } from "./movement.keys";

const STALE_TIME = 2 * 60 * 1000; // 2 minutes

export function useMovements(filters?: StockMovementFilters) {
  return useQuery({
    queryKey: movementKeys.list(filters),
    queryFn: () => getContainer().movementRepository.findAll(filters),
    staleTime: STALE_TIME,
  });
}

export function useMovement(id: string) {
  return useQuery({
    queryKey: movementKeys.detail(id),
    queryFn: () => getContainer().movementRepository.findById(id),
    staleTime: STALE_TIME,
    enabled: Boolean(id),
  });
}

export function useCreateMovement() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.movements");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (data: CreateStockMovementDto) =>
      getContainer().movementRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movementKeys.lists() });
      toast.success(t("messages.created"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useUpdateMovement() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.movements");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStockMovementDto }) =>
      getContainer().movementRepository.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: movementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: movementKeys.detail(id) });
      toast.success(t("messages.updated"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useDeleteMovement() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.movements");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (id: string) => getContainer().movementRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movementKeys.lists() });
      toast.success(t("messages.deleted"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function usePostMovement() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.movements");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (id: string) => getContainer().movementRepository.post(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: movementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: movementKeys.detail(id) });
      // Also invalidate stock queries since posting affects stock levels
      queryClient.invalidateQueries({ queryKey: stockKeys.lists() });
      toast.success(t("messages.posted"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useVoidMovement() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.movements");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (id: string) => getContainer().movementRepository.void(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: movementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: movementKeys.detail(id) });
      // Also invalidate stock queries since voiding reverses stock changes
      queryClient.invalidateQueries({ queryKey: stockKeys.lists() });
      toast.success(t("messages.voided"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}
