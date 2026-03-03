"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import type { ChangePasswordDto } from "../../application/dto/change-password.dto";

const settingsRepository = getContainer().settingsRepository;

export function useChangePassword() {
  const t = useTranslations("settings.password");

  return useMutation({
    mutationFn: (data: ChangePasswordDto) =>
      settingsRepository.changePassword(data),
    onSuccess: () => {
      toast.success(t("changed"));
    },
    onError: () => {
      toast.error(t("errorChanging"));
    },
  });
}
