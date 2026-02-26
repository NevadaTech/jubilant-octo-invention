"use client";

import { Download, FileSpreadsheet, FileCode } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu";
import { useReportExport } from "@/modules/reports/presentation/hooks/use-reports";
import type {
  ReportTypeValue,
  ReportParameters,
  ExportOptionsDto,
} from "@/modules/reports/application/dto/report.dto";

interface ReportExportButtonProps {
  type: ReportTypeValue;
  parameters?: ReportParameters;
  reportTitle?: string;
  disabled?: boolean;
}

export function ReportExportButton({
  type,
  parameters,
  reportTitle,
  disabled,
}: ReportExportButtonProps) {
  const { mutate, isPending } = useReportExport();
  const t = useTranslations("reports");
  const tCommon = useTranslations("common");

  const doExport = (format: "EXCEL" | "CSV") => {
    const options: ExportOptionsDto = {
      includeHeader: true,
      includeSummary: true,
      title: reportTitle,
    };
    mutate({ type, format, parameters, options });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isPending}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {isPending ? t("generating") : tCommon("export")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("exportFormat")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => doExport("EXCEL")} className="gap-2">
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          {t("exportExcel")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => doExport("CSV")} className="gap-2">
          <FileCode className="h-4 w-4 text-blue-500" />
          {t("exportCsv")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
