"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import type {
  CompanyFilters,
  CreateCompanyDto,
  UpdateCompanyDto,
} from "@/modules/companies/application/dto/company.dto";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: (filters?: CompanyFilters) =>
    [...companyKeys.lists(), filters] as const,
  details: () => [...companyKeys.all, "detail"] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
};

export function useCompanies(filters?: CompanyFilters) {
  return useQuery({
    queryKey: companyKeys.list(filters),
    queryFn: () => getContainer().companyRepository.findAll(filters),
    staleTime: STALE_TIME,
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => getContainer().companyRepository.findById(id),
    staleTime: STALE_TIME,
    enabled: Boolean(id),
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.companies");

  return useMutation({
    mutationFn: (data: CreateCompanyDto) =>
      getContainer().companyRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      toast.success(t("messages.created"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.companies");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyDto }) =>
      getContainer().companyRepository.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(id) });
      toast.success(t("messages.updated"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  const t = useTranslations("inventory.companies");

  return useMutation({
    mutationFn: (id: string) => getContainer().companyRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      toast.success(t("messages.deleted"));
    },
    onError: (error: unknown) => {
      const resp =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
          : undefined;
      const msg =
        typeof resp?.data?.message === "string" ? resp.data.message : undefined;
      toast.error(msg || t("toast.error"));
    },
  });
}
