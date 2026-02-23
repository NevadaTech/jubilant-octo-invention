"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { reportApiAdapter } from "../../infrastructure/adapters/report-api.adapter";
import type {
  ReportTypeValue,
  ReportFormatValue,
  ReportParameters,
  ExportOptionsDto,
} from "../../application/dto/report.dto";

const reportKeys = {
  all: ["reports"] as const,
  views: () => [...reportKeys.all, "view"] as const,
  view: (type: ReportTypeValue, params?: ReportParameters) =>
    [...reportKeys.views(), type, params] as const,
};

export function useReportView(
  type: ReportTypeValue | null,
  parameters?: ReportParameters,
  enabled = true,
) {
  return useQuery({
    queryKey: type ? reportKeys.view(type, parameters) : reportKeys.all,
    queryFn: () => reportApiAdapter.viewReport(type!, parameters),
    enabled: !!type && enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useReportExport() {
  return useMutation({
    mutationFn: async ({
      type,
      format,
      parameters,
      options,
    }: {
      type: ReportTypeValue;
      format: ReportFormatValue;
      parameters?: ReportParameters;
      options?: ExportOptionsDto;
    }) => {
      const blob = await reportApiAdapter.exportReport(
        type,
        format,
        parameters,
        options,
      );
      return { blob, format };
    },
    onSuccess: ({ blob, format }, { type }) => {
      const ext = format === "EXCEL" ? "xlsx" : format.toLowerCase();
      const filename = `report-${type.toLowerCase().replace(/_/g, "-")}-${new Date().toISOString().split("T")[0]}.${ext}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });
}
