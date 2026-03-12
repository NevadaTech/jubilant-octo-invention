import { ImportBatch } from "@/modules/imports/domain/entities/import-batch.entity";
import { ImportPreview } from "@/modules/imports/domain/entities/import-preview.entity";
import type {
  ImportBatchApiDto,
  ImportPreviewResponseDto,
  ImportStatusResponseDto,
} from "@/modules/imports/application/dto/import.dto";
import type { ImportType, ImportStatus } from "@/modules/imports/domain/entities";

export class ImportMapper {
  static toDomain(dto: ImportBatchApiDto): ImportBatch {
    return ImportBatch.create(dto.id, {
      type: dto.type as ImportType,
      status: dto.status as ImportStatus,
      fileName: dto.fileName,
      totalRows: dto.totalRows,
      processedRows: dto.processedRows,
      validRows: dto.validRows,
      invalidRows: dto.invalidRows,
      progress: dto.progress,
      createdBy: dto.createdBy,
      createdAt: dto.createdAt,
      completedAt: dto.completedAt,
      errorMessage: dto.errorMessage,
      note: dto.note,
    });
  }

  static toDetailDomain(dto: ImportStatusResponseDto): ImportBatch {
    return ImportBatch.create(dto.data.id, {
      type: dto.data.type as ImportType,
      status: dto.data.status as ImportStatus,
      fileName: dto.data.fileName,
      totalRows: dto.data.totalRows,
      processedRows: dto.data.processedRows,
      validRows: dto.data.validRows,
      invalidRows: dto.data.invalidRows,
      progress: dto.data.progress,
      createdBy: dto.data.createdBy,
      createdAt: dto.data.createdAt,
      completedAt: dto.data.completedAt,
      errorMessage: dto.data.errorMessage,
      rows: dto.data.rows?.map((row) => ({
        rowNumber: row.rowNumber,
        data: row.data,
        isValid: row.isValid,
        errors: row.errors,
        warnings: row.warnings,
      })),
    });
  }

  static toPreview(dto: ImportPreviewResponseDto): ImportPreview {
    return new ImportPreview(
      dto.data.totalRows,
      dto.data.validRows,
      dto.data.invalidRows,
      dto.data.structureErrors.map((msg) => ({ message: msg })),
      dto.data.rowErrors,
      dto.data.warnings,
    );
  }
}
