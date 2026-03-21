"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import { getApiErrorMessage } from "@/shared/presentation/utils/get-api-error-message";
import type {
  GetCombosQueryDto,
  GetComboAvailabilityQueryDto,
  GetComboSalesReportQueryDto,
  GetComboStockImpactQueryDto,
  CreateComboDto,
  UpdateComboDto,
} from "@/modules/inventory/application/dto/combo.dto";
import { comboKeys } from "./combo.keys";

export { comboKeys } from "./combo.keys";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useCombos(filters?: GetCombosQueryDto) {
  return useQuery({
    queryKey: comboKeys.list(filters),
    queryFn: () => getContainer().comboRepository.findAll(filters),
    staleTime: STALE_TIME,
  });
}

export function useCombo(id: string) {
  return useQuery({
    queryKey: comboKeys.detail(id),
    queryFn: () => getContainer().comboRepository.findById(id),
    staleTime: STALE_TIME,
    enabled: Boolean(id),
  });
}

export function useComboAvailability(filters?: GetComboAvailabilityQueryDto) {
  return useQuery({
    queryKey: comboKeys.availabilityList(filters),
    queryFn: () => getContainer().comboRepository.getAvailability(filters),
    staleTime: STALE_TIME,
  });
}

export function useComboSalesReport(filters?: GetComboSalesReportQueryDto) {
  return useQuery({
    queryKey: comboKeys.salesReport(filters),
    queryFn: () => getContainer().comboRepository.getSalesReport(filters),
    staleTime: STALE_TIME,
  });
}

export function useComboStockImpact(
  productId: string,
  filters?: GetComboStockImpactQueryDto,
) {
  return useQuery({
    queryKey: comboKeys.stockImpact(productId, filters),
    queryFn: () =>
      getContainer().comboRepository.getStockImpact(productId, filters),
    staleTime: STALE_TIME,
    enabled: Boolean(productId),
  });
}

export function useCreateCombo() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.combos");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (data: CreateComboDto) =>
      getContainer().comboRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: comboKeys.lists() });
      toast.success(t("messages.created"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useUpdateCombo() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.combos");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateComboDto }) =>
      getContainer().comboRepository.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: comboKeys.lists() });
      queryClient.invalidateQueries({ queryKey: comboKeys.detail(id) });
      toast.success(t("messages.updated"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useDeactivateCombo() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.combos");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (id: string) => getContainer().comboRepository.deactivate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: comboKeys.lists() });
      queryClient.invalidateQueries({ queryKey: comboKeys.detail(id) });
      toast.success(t("messages.deactivated"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}
