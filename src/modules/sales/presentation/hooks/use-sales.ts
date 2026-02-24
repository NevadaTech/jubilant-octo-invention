"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { saleApiAdapter } from "../../infrastructure/adapters/sale-api.adapter";
import type {
  SaleFilters,
  CreateSaleDto,
  CreateSaleLineDto,
  ShipSaleDto,
  UpdateSaleDto,
} from "../../application/dto/sale.dto";

const saleKeys = {
  all: ["sales"] as const,
  lists: () => [...saleKeys.all, "list"] as const,
  list: (filters?: SaleFilters) => [...saleKeys.lists(), filters] as const,
  details: () => [...saleKeys.all, "detail"] as const,
  detail: (id: string) => [...saleKeys.details(), id] as const,
  returns: (id: string) => [...saleKeys.all, "returns", id] as const,
};

export function useSales(filters?: SaleFilters) {
  return useQuery({
    queryKey: saleKeys.list(filters),
    queryFn: () => saleApiAdapter.findAll(filters),
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: saleKeys.detail(id),
    queryFn: () => saleApiAdapter.findById(id),
    enabled: !!id,
  });
}

export function useSaleReturns(saleId: string, enabled = true) {
  return useQuery({
    queryKey: saleKeys.returns(saleId),
    queryFn: () => saleApiAdapter.getReturns(saleId),
    enabled: !!saleId && enabled,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  const t = useTranslations("sales");

  return useMutation({
    mutationFn: (data: CreateSaleDto) => saleApiAdapter.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      toast.success(t("messages.created"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();
  const t = useTranslations("sales");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSaleDto }) =>
      saleApiAdapter.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      toast.success(t("messages.updated"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useConfirmSale() {
  const queryClient = useQueryClient();
  const t = useTranslations("sales");

  return useMutation({
    mutationFn: (id: string) => saleApiAdapter.confirm(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      toast.success(t("messages.confirmed"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useCancelSale() {
  const queryClient = useQueryClient();
  const t = useTranslations("sales");

  return useMutation({
    mutationFn: (id: string) => saleApiAdapter.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      toast.success(t("messages.cancelled"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useStartPicking() {
  const queryClient = useQueryClient();
  const t = useTranslations("sales");

  return useMutation({
    mutationFn: (id: string) => saleApiAdapter.startPicking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      toast.success(t("messages.pickingStarted"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useShipSale() {
  const queryClient = useQueryClient();
  const t = useTranslations("sales");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ShipSaleDto }) =>
      saleApiAdapter.ship(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      toast.success(t("messages.shipped"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useCompleteSale() {
  const queryClient = useQueryClient();
  const t = useTranslations("sales");

  return useMutation({
    mutationFn: (id: string) => saleApiAdapter.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      toast.success(t("messages.completed"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useAddSaleLine() {
  const queryClient = useQueryClient();
  const t = useTranslations("sales");

  return useMutation({
    mutationFn: ({
      saleId,
      line,
    }: {
      saleId: string;
      line: CreateSaleLineDto;
    }) => saleApiAdapter.addLine(saleId, line),
    onSuccess: (_, { saleId }) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(saleId) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      toast.success(t("messages.lineAdded"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useRemoveSaleLine() {
  const queryClient = useQueryClient();
  const t = useTranslations("sales");

  return useMutation({
    mutationFn: ({ saleId, lineId }: { saleId: string; lineId: string }) =>
      saleApiAdapter.removeLine(saleId, lineId),
    onSuccess: (_, { saleId }) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(saleId) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      toast.success(t("messages.lineRemoved"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}
