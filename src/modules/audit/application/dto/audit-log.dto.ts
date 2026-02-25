export interface AuditLogResponseDto {
  id: string;
  orgId: string | null;
  entityType: string;
  entityId: string | null;
  action: string;
  performedBy: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  httpMethod: string | null;
  httpUrl: string | null;
  httpStatusCode: number | null;
  duration: number | null;
  createdAt: string;
}

export interface AuditLogFilters {
  entityType?: string;
  entityId?: string;
  action?: string;
  performedBy?: string;
  httpMethod?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
