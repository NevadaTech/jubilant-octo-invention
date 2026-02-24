"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { reorderRuleApiAdapter } from "../../infrastructure/adapters/reorder-rule-api.adapter";
import { stockKeys } from "./use-stock";
import type {
  CreateReorderRuleDto,
  UpdateReorderRuleDto,
} from "../../application/dto/reorder-rule.dto";

export const reorderRuleKeys = {
  all: ["reorder-rules"] as const,
  lists: () => [...reorderRuleKeys.all, "list"] as const,
};

export function useReorderRules() {
  return useQuery({
    queryKey: reorderRuleKeys.lists(),
    queryFn: () => reorderRuleApiAdapter.findAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateReorderRule() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.stock.reorderRule");

  return useMutation({
    mutationFn: (dto: CreateReorderRuleDto) =>
      reorderRuleApiAdapter.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reorderRuleKeys.all });
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
      toast.success(t("messages.created"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useUpdateReorderRule() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.stock.reorderRule");

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateReorderRuleDto }) =>
      reorderRuleApiAdapter.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reorderRuleKeys.all });
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
      toast.success(t("messages.updated"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useDeleteReorderRule() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.stock.reorderRule");

  return useMutation({
    mutationFn: (id: string) => reorderRuleApiAdapter.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reorderRuleKeys.all });
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
      toast.success(t("messages.deleted"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}
