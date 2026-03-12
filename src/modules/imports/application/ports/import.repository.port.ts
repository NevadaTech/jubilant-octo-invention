import type { PaginatedResult } from "@/shared/application/dto/pagination.dto";
import type { ImportBatch, ImportType } from "@/modules/imports/domain/entities";
import type { ImportPreview } from "@/modules/imports/domain/entities/import-preview.entity";
import type { ImportFilters, TemplateFormat } from "@/modules/imports/application/dto/import.dto";

export type { PaginatedResult };

export interface ImportRepositoryPort {
  findAll(filters: ImportFilters): Promise<PaginatedResult<ImportBatch>>;
  getStatus(id: string): Promise<ImportBatch | null>;
  preview(file: File, type: ImportType): Promise<ImportPreview>;
  execute(file: File, type: ImportType, note?: string): Promise<ImportBatch>;
  downloadTemplate(type: ImportType, format: TemplateFormat): Promise<Blob>;
  downloadErrors(id: string, format: TemplateFormat): Promise<Blob>;
}
