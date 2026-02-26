"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import type {
  CategoryFilters,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/modules/inventory/application/dto/category.dto";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters?: CategoryFilters) =>
    [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export function useCategories(filters?: CategoryFilters) {
  return useQuery({
    queryKey: categoryKeys.list(filters),
    queryFn: () => getContainer().categoryRepository.findAll(filters),
    staleTime: STALE_TIME,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => getContainer().categoryRepository.findById(id),
    staleTime: STALE_TIME,
    enabled: Boolean(id),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.categories");

  return useMutation({
    mutationFn: (data: CreateCategoryDto) =>
      getContainer().categoryRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success(t("messages.created"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.categories");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      getContainer().categoryRepository.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) });
      toast.success(t("messages.updated"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.categories");

  return useMutation({
    mutationFn: (id: string) => getContainer().categoryRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success(t("messages.deleted"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}
