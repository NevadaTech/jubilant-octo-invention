import { apiClient } from "@/shared/infrastructure/http";
import type { ReportRepositoryPort } from "@/modules/reports/application/ports/report.repository.port";
import type {
  ReportTypeValue,
  ReportFormatValue,
  ReportParameters,
  ReportResult,
  ReportViewResponseDto,
  ExportOptionsDto,
} from "@/modules/reports/application/dto/report.dto";
import { REPORT_PATHS } from "@/modules/reports/application/dto/report.dto";

export class ReportApiAdapter implements ReportRepositoryPort {
  private buildQueryParams(
    parameters?: ReportParameters,
  ): Record<string, unknown> {
    if (!parameters) return {};
    const params: Record<string, unknown> = {};

    if (parameters.dateRange?.startDate)
      params["dateRange[startDate]"] = parameters.dateRange.startDate;
    if (parameters.dateRange?.endDate)
      params["dateRange[endDate]"] = parameters.dateRange.endDate;
    if (parameters.warehouseId) params.warehouseId = parameters.warehouseId;
    if (parameters.productId) params.productId = parameters.productId;
    if (parameters.category) params.category = parameters.category;
    if (parameters.status) params.status = parameters.status;
    if (parameters.returnType) params.returnType = parameters.returnType;
    if (parameters.groupBy) params.groupBy = parameters.groupBy;
    if (parameters.period) params.period = parameters.period;
    if (parameters.movementType) params.movementType = parameters.movementType;
    if (parameters.customerReference)
      params.customerReference = parameters.customerReference;
    if (parameters.saleId) params.saleId = parameters.saleId;
    if (parameters.movementId) params.movementId = parameters.movementId;
    if (parameters.includeInactive !== undefined)
      params.includeInactive = parameters.includeInactive;
    if (parameters.locationId) params.locationId = parameters.locationId;
    if (parameters.severity) params.severity = parameters.severity;
    if (parameters.deadStockDays)
      params.deadStockDays = parameters.deadStockDays;

    return params;
  }

  async viewReport(
    type: ReportTypeValue,
    parameters?: ReportParameters,
  ): Promise<ReportResult> {
    const basePath = REPORT_PATHS[type];
    const response = await apiClient.get<ReportViewResponseDto>(
      `${basePath}/view`,
      { params: this.buildQueryParams(parameters) },
    );

    const { data } = response.data;
    return {
      columns: data.columns,
      rows: data.rows,
      metadata: data.metadata,
      summary: data.summary,
      fromCache: response.data.fromCache,
    };
  }

  async exportReport(
    type: ReportTypeValue,
    format: ReportFormatValue,
    parameters?: ReportParameters,
    options?: ExportOptionsDto,
  ): Promise<Blob> {
    const basePath = REPORT_PATHS[type];
    const response = await apiClient.post<Blob>(
      `${basePath}/export`,
      { format, parameters, options, saveMetadata: true },
      { responseType: "blob" } as Record<string, unknown>,
    );
    return response.data;
  }
}
