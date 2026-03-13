import type {
  ImportType,
  ImportStatus,
} from "@/modules/imports/domain/entities";

export interface ImportBatchApiDto {
  id: string;
  type: string;
  status: string;
  fileName: string;
  totalRows: number;
  processedRows: number;
  validRows: number;
  invalidRows: number;
  progress: number;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  note?: string;
}

export interface ImportBatchListResponseDto {
  success: boolean;
  message: string;
  data: ImportBatchApiDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface ImportRowApiDto {
  rowNumber: number;
  data: Record<string, unknown>;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ImportStatusResponseDto {
  success: boolean;
  message: string;
  data: ImportBatchApiDto & {
    startedAt?: string;
    validatedAt?: string;
    rows?: ImportRowApiDto[];
  };
  timestamp: string;
}

export interface ImportPreviewResponseDto {
  success: boolean;
  message: string;
  data: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    structureErrors: string[];
    rowErrors: {
      rowNumber: number;
      column?: string;
      value?: string;
      error: string;
      severity: "error" | "warning";
    }[];
    warnings: string[];
  };
  timestamp: string;
}

export interface ImportExecuteResponseDto {
  success: boolean;
  message: string;
  data: {
    id: string;
    status: string;
    totalRows: number;
    processedRows: number;
    validRows: number;
    invalidRows: number;
  };
  timestamp: string;
}

export interface ImportFilters {
  type?: ImportType;
  status?: ImportStatus;
  page?: number;
  limit?: number;
}

export type TemplateFormat = "csv" | "xlsx";
