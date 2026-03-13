"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import { getApiErrorMessage } from "@/shared/presentation/utils/get-api-error-message";
import type {
  UserFilters,
  CreateUserDto,
  UpdateUserDto,
  ChangeUserStatusDto,
  AssignRoleDto,
} from "@/modules/users/application/dto/user.dto";
import { userKeys } from "./user.keys";

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => getContainer().userRepository.findAll(filters),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getContainer().userRepository.findById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const t = useTranslations("users");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (data: CreateUserDto) =>
      getContainer().userRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(t("messages.created"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const t = useTranslations("users");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      getContainer().userRepository.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      toast.success(t("messages.updated"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useChangeUserStatus() {
  const queryClient = useQueryClient();
  const t = useTranslations("users");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangeUserStatusDto }) =>
      getContainer().userRepository.changeStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      toast.success(t("messages.statusChanged"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();
  const t = useTranslations("users");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: AssignRoleDto }) =>
      getContainer().userRepository.assignRole(userId, data),
    onSuccess: async (_, { userId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) }),
        queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
      ]);
      toast.success(t("roles.assignSuccess"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useRemoveRole() {
  const queryClient = useQueryClient();
  const t = useTranslations("users");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      getContainer().userRepository.removeRole(userId, roleId),
    onSuccess: async (_, { userId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) }),
        queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
      ]);
      toast.success(t("roles.removeSuccess"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export { userKeys } from "./user.keys";
