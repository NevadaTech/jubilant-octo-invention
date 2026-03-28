"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import { getApiErrorMessage } from "@/shared/presentation/utils/get-api-error-message";
import type {
  BrandFilters,
  CreateBrandDto,
  UpdateBrandDto,
} from "@/modules/brands/application/dto/brand.dto";
import { brandKeys } from "./brand.keys";

export { brandKeys } from "./brand.keys";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useBrands(filters?: BrandFilters) {
  return useQuery({
    queryKey: brandKeys.list(filters),
    queryFn: () => getContainer().brandRepository.findAll(filters),
    staleTime: STALE_TIME,
  });
}

export function useBrand(id: string) {
  return useQuery({
    queryKey: brandKeys.detail(id),
    queryFn: () => getContainer().brandRepository.findById(id),
    staleTime: STALE_TIME,
    enabled: Boolean(id),
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.brands");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (data: CreateBrandDto) =>
      getContainer().brandRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      toast.success(t("messages.created"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.brands");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandDto }) =>
      getContainer().brandRepository.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      queryClient.invalidateQueries({ queryKey: brandKeys.detail(id) });
      toast.success(t("messages.updated"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.brands");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (id: string) => getContainer().brandRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      toast.success(t("messages.deleted"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}
