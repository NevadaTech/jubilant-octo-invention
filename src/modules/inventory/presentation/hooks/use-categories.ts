"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import { getApiErrorMessage } from "@/shared/presentation/utils/get-api-error-message";
import type {
  CategoryFilters,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/modules/inventory/application/dto/category.dto";
import { categoryKeys } from "./category.keys";

export { categoryKeys } from "./category.keys";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

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
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (data: CreateCategoryDto) =>
      getContainer().categoryRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success(t("messages.created"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.categories");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      getContainer().categoryRepository.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) });
      toast.success(t("messages.updated"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.categories");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (id: string) => getContainer().categoryRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success(t("messages.deleted"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}
