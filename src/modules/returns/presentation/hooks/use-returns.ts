"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import type {
  ReturnFilters,
  CreateReturnDto,
  CreateReturnLineDto,
  UpdateReturnDto,
} from "@/modules/returns/application/dto/return.dto";

const returnKeys = {
  all: ["returns"] as const,
  lists: () => [...returnKeys.all, "list"] as const,
  list: (filters?: ReturnFilters) => [...returnKeys.lists(), filters] as const,
  details: () => [...returnKeys.all, "detail"] as const,
  detail: (id: string) => [...returnKeys.details(), id] as const,
};

export function useReturns(filters?: ReturnFilters) {
  return useQuery({
    queryKey: returnKeys.list(filters),
    queryFn: () => getContainer().returnRepository.findAll(filters),
  });
}

export function useReturn(id: string) {
  return useQuery({
    queryKey: returnKeys.detail(id),
    queryFn: () => getContainer().returnRepository.findById(id),
    enabled: !!id,
  });
}

export function useCreateReturn() {
  const queryClient = useQueryClient();
  const t = useTranslations("returns");

  return useMutation({
    mutationFn: (data: CreateReturnDto) =>
      getContainer().returnRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: returnKeys.lists() });
      toast.success(t("messages.created"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useUpdateReturn() {
  const queryClient = useQueryClient();
  const t = useTranslations("returns");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReturnDto }) =>
      getContainer().returnRepository.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: returnKeys.lists() });
      queryClient.invalidateQueries({ queryKey: returnKeys.detail(id) });
      toast.success(t("messages.updated"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useConfirmReturn() {
  const queryClient = useQueryClient();
  const t = useTranslations("returns");

  return useMutation({
    mutationFn: (id: string) => getContainer().returnRepository.confirm(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: returnKeys.lists() });
      queryClient.invalidateQueries({ queryKey: returnKeys.detail(id) });
      toast.success(t("messages.confirmed"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useCancelReturn() {
  const queryClient = useQueryClient();
  const t = useTranslations("returns");

  return useMutation({
    mutationFn: (id: string) => getContainer().returnRepository.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: returnKeys.lists() });
      queryClient.invalidateQueries({ queryKey: returnKeys.detail(id) });
      toast.success(t("messages.cancelled"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useAddReturnLine() {
  const queryClient = useQueryClient();
  const t = useTranslations("returns");

  return useMutation({
    mutationFn: ({
      returnId,
      line,
    }: {
      returnId: string;
      line: CreateReturnLineDto;
    }) => getContainer().returnRepository.addLine(returnId, line),
    onSuccess: (_, { returnId }) => {
      queryClient.invalidateQueries({ queryKey: returnKeys.detail(returnId) });
      queryClient.invalidateQueries({ queryKey: returnKeys.lists() });
      toast.success(t("messages.lineAdded"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useRemoveReturnLine() {
  const queryClient = useQueryClient();
  const t = useTranslations("returns");

  return useMutation({
    mutationFn: ({ returnId, lineId }: { returnId: string; lineId: string }) =>
      getContainer().returnRepository.removeLine(returnId, lineId),
    onSuccess: (_, { returnId }) => {
      queryClient.invalidateQueries({ queryKey: returnKeys.detail(returnId) });
      queryClient.invalidateQueries({ queryKey: returnKeys.lists() });
      toast.success(t("messages.lineRemoved"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}
