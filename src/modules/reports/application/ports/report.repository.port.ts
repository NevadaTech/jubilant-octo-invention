import type {
  ReportParameters,
  ReportFormatValue,
  ReportTypeValue,
  ReportResult,
  ExportOptionsDto,
} from "@/modules/reports/application/dto/report.dto";

export interface ReportRepositoryPort {
  viewReport(
    type: ReportTypeValue,
    parameters?: ReportParameters,
  ): Promise<ReportResult>;
  exportReport(
    type: ReportTypeValue,
    format: ReportFormatValue,
    parameters?: ReportParameters,
    options?: ExportOptionsDto,
  ): Promise<Blob>;
}
