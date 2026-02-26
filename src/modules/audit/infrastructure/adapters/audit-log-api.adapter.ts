import { apiClient } from "@/shared/infrastructure/http";
import type { AuditLog } from "@/modules/audit/domain/entities/audit-log.entity";
import type {
  AuditLogRepositoryPort,
  PaginatedResult,
} from "@/modules/audit/application/ports/audit-log.repository.port";
import type {
  AuditLogResponseDto,
  AuditLogFilters,
} from "@/modules/audit/application/dto/audit-log.dto";
import { AuditLogMapper } from "@/modules/audit/application/mappers/audit-log.mapper";

interface ApiListResponse {
  success: boolean;
  message: string;
  data: AuditLogResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: AuditLogResponseDto;
  timestamp: string;
}

export class AuditLogApiAdapter implements AuditLogRepositoryPort {
  private readonly basePath = "/audit";

  async findAll(filters?: AuditLogFilters): Promise<PaginatedResult<AuditLog>> {
    const response = await apiClient.get<ApiListResponse>(
      `${this.basePath}/logs`,
      { params: this.buildQueryParams(filters) },
    );

    return {
      data: response.data.data.map(AuditLogMapper.toDomain),
      pagination: response.data.pagination,
    };
  }

  async findById(id: string): Promise<AuditLog | null> {
    try {
      const response = await apiClient.get<ApiResponse>(
        `${this.basePath}/logs/${id}`,
      );
      return AuditLogMapper.toDomain(response.data.data);
    } catch (error) {
      if (this.isNotFoundError(error)) return null;
      throw error;
    }
  }

  private buildQueryParams(filters?: AuditLogFilters): Record<string, unknown> {
    if (!filters) return {};
    const params: Record<string, unknown> = {};
    if (filters.entityType) params.entityType = filters.entityType;
    if (filters.entityId) params.entityId = filters.entityId;
    if (filters.action) params.action = filters.action;
    if (filters.performedBy) params.performedBy = filters.performedBy;
    if (filters.httpMethod) params.httpMethod = filters.httpMethod;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    return params;
  }

  private isNotFoundError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: { status?: number } }).response ===
        "object" &&
      (error as { response: { status?: number } }).response?.status === 404
    );
  }
}
