"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import { getApiErrorMessage } from "@/shared/presentation/utils/get-api-error-message";
import type {
  ProductFilters,
  CreateProductDto,
  UpdateProductDto,
} from "@/modules/inventory/application/dto";
import { productKeys } from "./product.keys";

export { productKeys } from "./product.keys";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => getContainer().productRepository.findAll(filters),
    staleTime: STALE_TIME,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getContainer().productRepository.findById(id),
    staleTime: STALE_TIME,
    enabled: Boolean(id),
  });
}

export function useLookupProduct(code: string) {
  return useQuery({
    queryKey: productKeys.lookup(code),
    queryFn: () => getContainer().productRepository.lookupByCode(code),
    staleTime: STALE_TIME,
    enabled: Boolean(code),
    retry: false,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.products");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (data: CreateProductDto) =>
      getContainer().productRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success(t("messages.created"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.products");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      getContainer().productRepository.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      toast.success(t("messages.updated"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useToggleProductStatus() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.products");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      getContainer().productRepository.update(id, { isActive }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      toast.success(t("messages.updated"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

/**
 * Imperative barcode/SKU lookup. Unlike `useLookupProduct` (which is reactive
 * and tied to a query key), this returns a mutation you can trigger from a
 * scanner event handler to get `Product | null` on demand.
 *
 * Use `mutateAsync(code)` from inside `onScan` callbacks and handle the
 * null case to show a "not found" toast.
 */
export function useProductImage(productId: string, enabled: boolean) {
  return useQuery({
    queryKey: productKeys.image(productId),
    queryFn: () => getContainer().productRepository.fetchImage(productId),
    enabled: enabled && Boolean(productId),
    staleTime: STALE_TIME,
    retry: false,
  });
}

export function useUploadProductImage() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.products.photo");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) =>
      getContainer().productRepository.uploadImage(productId, file),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.image(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success(t("uploaded"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.products.photo");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (productId: string) =>
      getContainer().productRepository.deleteImage(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: productKeys.image(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success(t("removed"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useProductLookupMutation() {
  return useMutation({
    mutationFn: (code: string) =>
      getContainer().productRepository.lookupByCode(code),
  });
}
