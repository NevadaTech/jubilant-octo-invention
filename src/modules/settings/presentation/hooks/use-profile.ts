"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import { TokenService } from "@/modules/authentication/infrastructure/services/token.service";
import { UserMapper } from "@/modules/authentication/infrastructure/mappers/user.mapper";
import { useAuthStore } from "@/modules/authentication/presentation/store/auth.store";
import type { UpdateProfileDto } from "../../application/dto";

const settingsRepository = getContainer().settingsRepository;

const profileKeys = {
  all: ["profile"] as const,
  me: () => [...profileKeys.all, "me"] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: () => settingsRepository.getProfile(),
    select: (response) => response.data,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const t = useTranslations("settings.profile");

  return useMutation({
    mutationFn: (data: UpdateProfileDto) =>
      settingsRepository.updateProfile(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });

      // Update stored user in localStorage and auth store
      const storedUser = TokenService.getUser();
      if (storedUser) {
        const updatedUser = {
          ...storedUser,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          phone: response.data.phone,
          timezone: response.data.timezone,
          language: response.data.language,
          jobTitle: response.data.jobTitle,
          department: response.data.department,
        };
        TokenService.setUser(updatedUser);

        // Update zustand auth store so header reflects changes immediately
        const user = UserMapper.toDomain(updatedUser);
        useAuthStore.setState({ user });
      }

      toast.success(t("saved"));
    },
    onError: () => {
      toast.error(t("errorSaving"));
    },
  });
}
