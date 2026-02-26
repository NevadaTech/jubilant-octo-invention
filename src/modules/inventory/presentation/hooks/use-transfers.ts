"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import type {
  TransferFilters,
  CreateTransferDto,
  ReceiveTransferDto,
} from "@/modules/inventory/application/dto/transfer.dto";
import type { TransferStatus } from "@/modules/inventory/domain/entities/transfer.entity";
import { stockKeys } from "./use-stock";

const STALE_TIME = 2 * 60 * 1000; // 2 minutes

export const transferKeys = {
  all: ["transfers"] as const,
  lists: () => [...transferKeys.all, "list"] as const,
  list: (filters?: TransferFilters) =>
    [...transferKeys.lists(), filters] as const,
  details: () => [...transferKeys.all, "detail"] as const,
  detail: (id: string) => [...transferKeys.details(), id] as const,
};

export function useTransfers(filters?: TransferFilters) {
  return useQuery({
    queryKey: transferKeys.list(filters),
    queryFn: () => getContainer().transferRepository.findAll(filters),
    staleTime: STALE_TIME,
  });
}

export function useTransfer(id: string) {
  return useQuery({
    queryKey: transferKeys.detail(id),
    queryFn: () => getContainer().transferRepository.findById(id),
    staleTime: STALE_TIME,
    enabled: Boolean(id),
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.transfers");

  return useMutation({
    mutationFn: (data: CreateTransferDto) =>
      getContainer().transferRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transferKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stockKeys.lists() });
      toast.success(t("messages.created"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useUpdateTransferStatus() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.transfers");

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TransferStatus }) =>
      getContainer().transferRepository.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: transferKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transferKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: stockKeys.lists() });
      toast.success(t("messages.updated"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useReceiveTransfer() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.transfers");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReceiveTransferDto }) =>
      getContainer().transferRepository.receive(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: transferKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transferKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: stockKeys.lists() });
      toast.success(t("messages.received"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}
