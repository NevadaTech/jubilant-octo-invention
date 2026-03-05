"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import { getApiErrorMessage } from "@/shared/presentation/utils/get-api-error-message";
import type {
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
} from "@/modules/roles/application/dto/role.dto";

const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  detail: (id: string) => [...roleKeys.all, "detail", id] as const,
  permissions: () => [...roleKeys.all, "permissions"] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: () => getContainer().roleRepository.findAll(),
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => getContainer().roleRepository.findById(id),
    enabled: !!id,
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: roleKeys.permissions(),
    queryFn: () => getContainer().roleRepository.getPermissions(),
  });
}

export function useRolePermissions(roleId: string, enabled = true) {
  return useQuery({
    queryKey: [...roleKeys.detail(roleId), "permissions"] as const,
    queryFn: () => getContainer().roleRepository.getRolePermissions(roleId),
    enabled: !!roleId && enabled,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  const t = useTranslations("roles");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (data: CreateRoleDto) =>
      getContainer().roleRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast.success(t("messages.created"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  const t = useTranslations("roles");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDto }) =>
      getContainer().roleRepository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      toast.success(t("messages.updated"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  const t = useTranslations("roles");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: (id: string) => getContainer().roleRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast.success(t("messages.deleted"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useAssignPermissions() {
  const queryClient = useQueryClient();
  const t = useTranslations("roles");
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignPermissionsDto }) =>
      getContainer().roleRepository.assignPermissions(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      toast.success(t("messages.permissionsUpdated"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}
