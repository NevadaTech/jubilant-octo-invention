"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import { getApiErrorMessage } from "@/shared/presentation/utils/get-api-error-message";
import type {
  SaleFilters,
  CreateSaleDto,
  CreateSaleLineDto,
  ShipSaleDto,
  SwapSaleLineDto,
  UpdateSaleDto,
} from "@/modules/sales/application/dto/sale.dto";
import { saleKeys } from "./sale.keys";

export function useSales(filters?: SaleFilters) {
  return useQuery({
    queryKey: saleKeys.list(filters),
    queryFn: () => getContainer().saleRepository.findAll(filters),
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: saleKeys.detail(id),
    queryFn: () => getContainer().saleRepository.findById(id),
    enabled: !!id,
  });
}

export function useSaleReturns(saleId: string, enabled = true) {
  return useQuery({
    queryKey: saleKeys.returns(saleId),
    queryFn: () => getContainer().saleRepository.getReturns(saleId),
    enabled: !!saleId && enabled,
  });
}

export function useSaleSwapHistory(saleId: string, enabled = true) {
  return useQuery({
    queryKey: saleKeys.swaps(saleId),
    queryFn: () => getContainer().saleRepository.getSwapHistory(saleId),
    enabled: !!saleId && enabled,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  const t = useTranslations("sales");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (data: CreateSaleDto) =>
      getContainer().saleRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      toast.success(t("messages.created"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();
  const t = useTranslations("sales");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSaleDto }) =>
      getContainer().saleRepository.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      toast.success(t("messages.updated"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useConfirmSale() {
  const queryClient = useQueryClient();
  const t = useTranslations("sales");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (id: string) => getContainer().saleRepository.confirm(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      toast.success(t("messages.confirmed"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useCancelSale() {
  const queryClient = useQueryClient();
  const t = useTranslations("sales");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (id: string) => getContainer().saleRepository.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      toast.success(t("messages.cancelled"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useStartPicking() {
  const queryClient = useQueryClient();
  const t = useTranslations("sales");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (id: string) => getContainer().saleRepository.startPicking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      toast.success(t("messages.pickingStarted"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useShipSale() {
  const queryClient = useQueryClient();
  const t = useTranslations("sales");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ShipSaleDto }) =>
      getContainer().saleRepository.ship(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      toast.success(t("messages.shipped"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useCompleteSale() {
  const queryClient = useQueryClient();
  const t = useTranslations("sales");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (id: string) => getContainer().saleRepository.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      toast.success(t("messages.completed"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useAddSaleLine() {
  const queryClient = useQueryClient();
  const t = useTranslations("sales");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({
      saleId,
      line,
    }: {
      saleId: string;
      line: CreateSaleLineDto;
    }) => getContainer().saleRepository.addLine(saleId, line),
    onSuccess: (_, { saleId }) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(saleId) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      toast.success(t("messages.lineAdded"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useRemoveSaleLine() {
  const queryClient = useQueryClient();
  const t = useTranslations("sales");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({ saleId, lineId }: { saleId: string; lineId: string }) =>
      getContainer().saleRepository.removeLine(saleId, lineId),
    onSuccess: (_, { saleId }) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(saleId) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      toast.success(t("messages.lineRemoved"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useSwapSaleLine() {
  const queryClient = useQueryClient();
  const t = useTranslations("sales");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({ saleId, data }: { saleId: string; data: SwapSaleLineDto }) =>
      getContainer().saleRepository.swapLine(saleId, data),
    onSuccess: (_, { saleId }) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(saleId) });
      queryClient.invalidateQueries({ queryKey: saleKeys.swaps(saleId) });
      toast.success(t("messages.lineSwapped"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export { saleKeys } from "./sale.keys";
