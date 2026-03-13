"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import { getApiErrorMessage } from "@/shared/presentation/utils/get-api-error-message";
import type { UpdateAlertConfigurationDto } from "@/modules/settings/application/dto";
import { alertKeys } from "./alert.keys";

const settingsRepository = getContainer().settingsRepository;

export function useAlertConfiguration() {
  return useQuery({
    queryKey: alertKeys.config(),
    queryFn: () => settingsRepository.getAlertConfiguration(),
    select: (response) => response.data,
  });
}

export function useUpdateAlertConfiguration() {
  const queryClient = useQueryClient();
  const t = useTranslations("settings.alerts");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (data: UpdateAlertConfigurationDto) =>
      settingsRepository.updateAlertConfiguration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.all });
      toast.success(t("saved"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export { alertKeys } from "./alert.keys";
