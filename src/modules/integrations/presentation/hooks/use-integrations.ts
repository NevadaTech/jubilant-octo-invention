"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import { getApiErrorMessage } from "@/shared/presentation/utils/get-api-error-message";
import type {
  CreateIntegrationConnectionDto,
  UpdateIntegrationConnectionDto,
  IntegrationConnectionFilters,
} from "@/modules/integrations/application/dto/integration-connection.dto";
import type { SyncLogFilters } from "@/modules/integrations/application/dto/integration-sync-log.dto";
import type { CreateSkuMappingDto } from "@/modules/integrations/application/dto/integration-sku-mapping.dto";
import { integrationKeys } from "./integration.keys";

export { integrationKeys } from "./integration.keys";

const STALE_TIME = 5 * 60 * 1000;

export function useIntegrations(filters?: IntegrationConnectionFilters) {
  return useQuery({
    queryKey: integrationKeys.list(filters),
    queryFn: () => getContainer().integrationRepository.findAll(filters),
    staleTime: STALE_TIME,
  });
}

export function useIntegration(id: string) {
  return useQuery({
    queryKey: integrationKeys.detail(id),
    queryFn: () => getContainer().integrationRepository.findById(id),
    staleTime: STALE_TIME,
    enabled: Boolean(id),
  });
}

export function useCreateIntegration() {
  const queryClient = useQueryClient();
  const t = useTranslations("integrations");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (data: CreateIntegrationConnectionDto) =>
      getContainer().integrationRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.lists() });
      toast.success(t("messages.created"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useUpdateIntegration() {
  const queryClient = useQueryClient();
  const t = useTranslations("integrations");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateIntegrationConnectionDto;
    }) => getContainer().integrationRepository.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: integrationKeys.detail(id) });
      toast.success(t("messages.updated"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useDeleteIntegration() {
  const queryClient = useQueryClient();
  const t = useTranslations("integrations");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (id: string) => getContainer().integrationRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.lists() });
      toast.success(t("messages.deleted"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useTestIntegration() {
  const queryClient = useQueryClient();
  const t = useTranslations("integrations");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (id: string) =>
      getContainer().integrationRepository.testConnection(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(t("messages.testSuccess"));
      } else {
        toast.error(t("messages.testFailed"));
      }
      queryClient.invalidateQueries({ queryKey: integrationKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useTriggerSync() {
  const queryClient = useQueryClient();
  const t = useTranslations("integrations");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({
      id,
      fromDate,
      statuses,
    }: {
      id: string;
      fromDate?: string;
      statuses?: string[];
    }) =>
      getContainer().integrationRepository.triggerSync(id, fromDate, statuses),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: integrationKeys.logs(id) });
      toast.success(t("messages.syncStarted"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useSyncLogs(id: string, filters?: SyncLogFilters) {
  return useQuery({
    queryKey: integrationKeys.logList(id, filters),
    queryFn: () =>
      getContainer().integrationRepository.getSyncLogs(id, filters),
    staleTime: STALE_TIME,
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}

export function useSkuMappings(connectionId: string) {
  return useQuery({
    queryKey: integrationKeys.skuMappings(connectionId),
    queryFn: () =>
      getContainer().integrationRepository.getSkuMappings(connectionId),
    staleTime: STALE_TIME,
    enabled: Boolean(connectionId),
  });
}

export function useCreateSkuMapping(connectionId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations("integrations");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (data: CreateSkuMappingDto) =>
      getContainer().integrationRepository.createSkuMapping(connectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: integrationKeys.skuMappings(connectionId),
      });
      queryClient.invalidateQueries({
        queryKey: integrationKeys.unmatchedSkus(connectionId),
      });
      toast.success(t("skuMapping.added"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useDeleteSkuMapping(connectionId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations("integrations");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (mappingId: string) =>
      getContainer().integrationRepository.deleteSkuMapping(
        connectionId,
        mappingId,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: integrationKeys.skuMappings(connectionId),
      });
      toast.success(t("skuMapping.deleted"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useUnmatchedSkus(connectionId: string) {
  return useQuery({
    queryKey: integrationKeys.unmatchedSkus(connectionId),
    queryFn: () =>
      getContainer().integrationRepository.getUnmatchedSkus(connectionId),
    staleTime: STALE_TIME,
    enabled: Boolean(connectionId),
  });
}

export function useRetrySyncLog(connectionId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations("integrations");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (logId: string) =>
      getContainer().integrationRepository.retrySyncLog(connectionId, logId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: integrationKeys.logs(connectionId),
      });
      queryClient.invalidateQueries({
        queryKey: integrationKeys.detail(connectionId),
      });
      toast.success(t("failedSyncs.retrySuccess"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useGetMeliAuthUrl() {
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({
      connectionId,
      redirectUri,
    }: {
      connectionId: string;
      redirectUri: string;
    }) =>
      getContainer().integrationRepository.getMeliAuthUrl(
        connectionId,
        redirectUri,
      ),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useRetryAllFailed(connectionId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations("integrations");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: () =>
      getContainer().integrationRepository.retryAllFailed(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: integrationKeys.logs(connectionId),
      });
      queryClient.invalidateQueries({
        queryKey: integrationKeys.detail(connectionId),
      });
      toast.success(t("failedSyncs.retryAllSuccess"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}
