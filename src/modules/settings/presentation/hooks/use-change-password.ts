"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import { getApiErrorMessage } from "@/shared/presentation/utils/get-api-error-message";
import type { ChangePasswordDto } from "../../application/dto/change-password.dto";

const settingsRepository = getContainer().settingsRepository;

export function useChangePassword() {
  const t = useTranslations("settings.password");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (data: ChangePasswordDto) =>
      settingsRepository.changePassword(data),
    onSuccess: () => {
      toast.success(t("changed"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}
