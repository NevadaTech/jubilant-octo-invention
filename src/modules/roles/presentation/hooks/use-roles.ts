"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { roleApiAdapter } from "../../infrastructure/adapters/role-api.adapter";
import type {
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
} from "../../application/dto/role.dto";

const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  detail: (id: string) => [...roleKeys.all, "detail", id] as const,
  permissions: () => [...roleKeys.all, "permissions"] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: () => roleApiAdapter.findAll(),
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => roleApiAdapter.findById(id),
    enabled: !!id,
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: roleKeys.permissions(),
    queryFn: () => roleApiAdapter.getPermissions(),
  });
}

export function useRolePermissions(roleId: string, enabled = true) {
  return useQuery({
    queryKey: [...roleKeys.detail(roleId), "permissions"] as const,
    queryFn: () => roleApiAdapter.getRolePermissions(roleId),
    enabled: !!roleId && enabled,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  const t = useTranslations("roles");

  return useMutation({
    mutationFn: (data: CreateRoleDto) => roleApiAdapter.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast.success(t("messages.created"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  const t = useTranslations("roles");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDto }) =>
      roleApiAdapter.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      toast.success(t("messages.updated"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  const t = useTranslations("roles");

  return useMutation({
    mutationFn: (id: string) => roleApiAdapter.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast.success(t("messages.deleted"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}

export function useAssignPermissions() {
  const queryClient = useQueryClient();
  const t = useTranslations("roles");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignPermissionsDto }) =>
      roleApiAdapter.assignPermissions(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      toast.success(t("messages.permissionsUpdated"));
    },
    onError: () => {
      toast.error(t("toast.error"));
    },
  });
}
