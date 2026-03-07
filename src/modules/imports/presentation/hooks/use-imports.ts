"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getContainer } from "@/config/di/container";
import { getApiErrorMessage } from "@/shared/presentation/utils/get-api-error-message";
import type {
  ImportFilters,
  TemplateFormat,
} from "../../application/dto/import.dto";
import type { ImportType } from "../../domain/entities";

const importKeys = {
  all: ["imports"] as const,
  lists: () => [...importKeys.all, "list"] as const,
  list: (filters?: ImportFilters) => [...importKeys.lists(), filters] as const,
  statuses: () => [...importKeys.all, "status"] as const,
  status: (id: string) => [...importKeys.statuses(), id] as const,
};

export function useImports(filters?: ImportFilters) {
  return useQuery({
    queryKey: importKeys.list(filters),
    queryFn: () =>
      getContainer().importRepository.findAll(
        filters ?? { page: 1, limit: 20 },
      ),
    staleTime: 30 * 1000,
  });
}

export function useImportStatus(id: string | null) {
  return useQuery({
    queryKey: importKeys.status(id ?? ""),
    queryFn: () => getContainer().importRepository.getStatus(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const batch = query.state.data;
      if (!batch) return false;
      if (batch.isTerminal) return false;
      return 2000;
    },
    staleTime: 0,
  });
}

export function useDownloadTemplate() {
  const t = useTranslations();
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: async ({
      type,
      format,
    }: {
      type: ImportType;
      format: TemplateFormat;
    }) => {
      const blob = await getContainer().importRepository.downloadTemplate(
        type,
        format,
      );
      return { blob, type, format };
    },
    onSuccess: ({ blob, type, format }) => {
      const filename = `${type.toLowerCase()}_template.${format}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t("imports.messages.templateDownloaded"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function usePreviewImport() {
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: ({ file, type }: { file: File; type: ImportType }) =>
      getContainer().importRepository.preview(file, type),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useExecuteImport() {
  const t = useTranslations();
  const tErrors = useTranslations("apiErrors");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      type,
      note,
    }: {
      file: File;
      type: ImportType;
      note?: string;
    }) => getContainer().importRepository.execute(file, type, note),
    onSuccess: (_data, variables) => {
      toast.success(t("imports.messages.importStarted"));
      queryClient.invalidateQueries({ queryKey: importKeys.lists() });
      // Invalidate the module that was imported
      const moduleKeyMap: Record<ImportType, string> = {
        PRODUCTS: "products",
        MOVEMENTS: "movements",
        WAREHOUSES: "warehouses",
        STOCK: "stock",
        TRANSFERS: "transfers",
      };
      const moduleKey = moduleKeyMap[variables.type];
      if (moduleKey) {
        queryClient.invalidateQueries({ queryKey: [moduleKey] });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}

export function useDownloadErrors() {
  const t = useTranslations();
  const tErrors = useTranslations("apiErrors");

  return useMutation({
    mutationFn: async ({
      id,
      format,
    }: {
      id: string;
      format: TemplateFormat;
    }) => {
      const blob = await getContainer().importRepository.downloadErrors(
        id,
        format,
      );
      return { blob, id, format };
    },
    onSuccess: ({ blob, id, format }) => {
      const filename = `error_report_${id}.${format}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t("imports.messages.errorReportDownloaded"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tErrors));
    },
  });
}
