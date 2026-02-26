"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import type {
  UserFilters,
  CreateUserDto,
  UpdateUserDto,
  ChangeUserStatusDto,
  AssignRoleDto,
} from "@/modules/users/application/dto/user.dto";

const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

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

  return useMutation({
    mutationFn: (data: CreateUserDto) =>
      getContainer().userRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(t("messages.created"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const t = useTranslations("users");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      getContainer().userRepository.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      toast.success(t("messages.updated"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useChangeUserStatus() {
  const queryClient = useQueryClient();
  const t = useTranslations("users");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangeUserStatusDto }) =>
      getContainer().userRepository.changeStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      toast.success(t("messages.statusChanged"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();
  const t = useTranslations("users");

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
    onError: () => {
      toast.error(t("roles.assignError"));
    },
  });
}

export function useRemoveRole() {
  const queryClient = useQueryClient();
  const t = useTranslations("users");

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
    onError: () => {
      toast.error(t("roles.removeError"));
    },
  });
}
