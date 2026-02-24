"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { returnApiAdapter } from "../../infrastructure/adapters/return-api.adapter";
import type {
  ReturnFilters,
  CreateReturnDto,
  CreateReturnLineDto,
  UpdateReturnDto,
} from "../../application/dto/return.dto";

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
    queryFn: () => returnApiAdapter.findAll(filters),
  });
}

export function useReturn(id: string) {
  return useQuery({
    queryKey: returnKeys.detail(id),
    queryFn: () => returnApiAdapter.findById(id),
    enabled: !!id,
  });
}

export function useCreateReturn() {
  const queryClient = useQueryClient();
  const t = useTranslations("returns");

  return useMutation({
    mutationFn: (data: CreateReturnDto) => returnApiAdapter.create(data),
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
      returnApiAdapter.update(id, data),
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
    mutationFn: (id: string) => returnApiAdapter.confirm(id),
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
    mutationFn: (id: string) => returnApiAdapter.cancel(id),
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
    }) => returnApiAdapter.addLine(returnId, line),
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
      returnApiAdapter.removeLine(returnId, lineId),
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
