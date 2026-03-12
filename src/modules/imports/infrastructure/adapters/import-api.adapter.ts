import { apiClient } from "@/shared/infrastructure/http";
import type { PaginatedResult } from "@/shared/application/dto/pagination.dto";
import type { ImportRepositoryPort } from "@/modules/imports/application/ports/import.repository.port";
import type {
  ImportBatchApiDto,
  ImportBatchListResponseDto,
  ImportExecuteResponseDto,
  ImportFilters,
  ImportPreviewResponseDto,
  ImportStatusResponseDto,
  TemplateFormat,
} from "@/modules/imports/application/dto/import.dto";
import type { ImportBatch, ImportType } from "@/modules/imports/domain/entities";
import type { ImportPreview } from "@/modules/imports/domain/entities/import-preview.entity";
import { ImportMapper } from "@/modules/imports/application/mappers/import.mapper";

export class ImportApiAdapter implements ImportRepositoryPort {
  private readonly basePath = "/imports";

  async findAll(filters: ImportFilters): Promise<PaginatedResult<ImportBatch>> {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));
    if (filters.type) params.append("type", filters.type);
    if (filters.status) params.append("status", filters.status);

    const query = params.toString();
    const url = query ? `${this.basePath}?${query}` : this.basePath;

    const response = await apiClient.get<ImportBatchListResponseDto>(url);

    const data = response.data;
    return {
      data: data.data.map((dto) => ImportMapper.toDomain(dto)),
      pagination: data.pagination,
    };
  }

  async getStatus(id: string): Promise<ImportBatch | null> {
    try {
      const response = await apiClient.get<ImportStatusResponseDto>(
        `${this.basePath}/${id}/status`,
      );
      return ImportMapper.toDetailDomain(response.data);
    } catch {
      return null;
    }
  }

  async preview(file: File, type: ImportType): Promise<ImportPreview> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await apiClient.post<ImportPreviewResponseDto>(
      `${this.basePath}/preview`,
      formData,
    );

    return ImportMapper.toPreview(response.data);
  }

  async execute(
    file: File,
    type: ImportType,
    note?: string,
  ): Promise<ImportBatch> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    if (note) formData.append("note", note);

    const response = await apiClient.post<ImportExecuteResponseDto>(
      `${this.basePath}/execute`,
      formData,
    );

    const dto = response.data.data;
    return ImportMapper.toDomain({
      ...dto,
      type: type,
      fileName: file.name,
      progress:
        dto.totalRows > 0
          ? Math.round((dto.processedRows / dto.totalRows) * 100)
          : 0,
      createdBy: "",
      createdAt: new Date().toISOString(),
    } as ImportBatchApiDto);
  }

  async downloadTemplate(
    type: ImportType,
    format: TemplateFormat,
  ): Promise<Blob> {
    const mimeType =
      format === "xlsx"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "text/csv";
    const response = await apiClient.get<Blob>(
      `${this.basePath}/templates/${type}?format=${format}`,
      { responseType: "blob" },
    );
    const data = response.data;
    return data instanceof Blob
      ? data
      : new Blob([data as BlobPart], { type: mimeType });
  }

  async downloadErrors(id: string, format: TemplateFormat): Promise<Blob> {
    const mimeType =
      format === "xlsx"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "text/csv";
    const response = await apiClient.get<Blob>(
      `${this.basePath}/${id}/errors?format=${format}`,
      { responseType: "blob" },
    );
    const data = response.data;
    return data instanceof Blob
      ? data
      : new Blob([data as BlobPart], { type: mimeType });
  }
}
