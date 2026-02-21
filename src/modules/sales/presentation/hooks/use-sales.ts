"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { saleApiAdapter } from "../../infrastructure/adapters/sale-api.adapter";
import type {
  SaleFilters,
  CreateSaleDto,
  CreateSaleLineDto,
  UpdateSaleDto,
} from "../../application/dto/sale.dto";

const saleKeys = {
  all: ["sales"] as const,
  lists: () => [...saleKeys.all, "list"] as const,
  list: (filters?: SaleFilters) => [...saleKeys.lists(), filters] as const,
  details: () => [...saleKeys.all, "detail"] as const,
  detail: (id: string) => [...saleKeys.details(), id] as const,
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

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSaleDto) => saleApiAdapter.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSaleDto }) =>
      saleApiAdapter.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
    },
  });
}

export function useConfirmSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => saleApiAdapter.confirm(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
    },
  });
}

export function useCancelSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => saleApiAdapter.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
    },
  });
}

export function useAddSaleLine() {
  const queryClient = useQueryClient();

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
    },
  });
}

export function useRemoveSaleLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ saleId, lineId }: { saleId: string; lineId: string }) =>
      saleApiAdapter.removeLine(saleId, lineId),
    onSuccess: (_, { saleId }) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(saleId) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
    },
  });
}
