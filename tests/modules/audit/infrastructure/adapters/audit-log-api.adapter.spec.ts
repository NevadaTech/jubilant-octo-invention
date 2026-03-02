import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/shared/infrastructure/http", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from "@/shared/infrastructure/http";
import { AuditLogApiAdapter } from "@/modules/audit/infrastructure/adapters/audit-log-api.adapter";
import { AuditLog } from "@/modules/audit/domain/entities/audit-log.entity";
import type { AuditLogResponseDto } from "@/modules/audit/application/dto/audit-log.dto";

const mockedGet = vi.mocked(apiClient.get);

function buildAuditLogDto(
  overrides: Partial<AuditLogResponseDto> = {},
): AuditLogResponseDto {
  return {
    id: "log-1",
    orgId: "org-1",
    entityType: "PRODUCT",
    entityId: "prod-1",
    action: "CREATE",
    performedBy: "user-1",
    metadata: { productName: "Widget" },
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
    httpMethod: "POST",
    httpUrl: "/products",
    httpStatusCode: 201,
    duration: 45,
    createdAt: "2026-02-15T10:00:00.000Z",
    ...overrides,
  };
}

function wrapListResponse(
  data: AuditLogResponseDto[],
  pagination = {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
) {
  return {
    data: {
      success: true,
      message: "OK",
      data,
      pagination,
      timestamp: "2026-02-15T10:00:00.000Z",
    },
    status: 200,
    headers: {},
  };
}

function wrapDetailResponse(data: AuditLogResponseDto) {
  return {
    data: {
      success: true,
      message: "OK",
      data,
      timestamp: "2026-02-15T10:00:00.000Z",
    },
    status: 200,
    headers: {},
  };
}

describe("AuditLogApiAdapter", () => {
  let adapter: AuditLogApiAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new AuditLogApiAdapter();
  });

  describe("findAll", () => {
    it("Given audit logs exist, When findAll is called without filters, Then it returns paginated AuditLog entities", async () => {
      const dto1 = buildAuditLogDto({ id: "log-1", action: "CREATE" });
      const dto2 = buildAuditLogDto({ id: "log-2", action: "UPDATE" });
      mockedGet.mockResolvedValue(
        wrapListResponse([dto1, dto2], {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        }),
      );

      const result = await adapter.findAll();

      expect(mockedGet).toHaveBeenCalledWith("/audit/logs", { params: {} });
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(AuditLog);
      expect(result.pagination.total).toBe(2);
    });

    it("Given filters are provided, When findAll is called, Then all filter params are passed correctly", async () => {
      mockedGet.mockResolvedValue(wrapListResponse([]));

      await adapter.findAll({
        entityType: "SALE",
        entityId: "sale-5",
        action: "CONFIRM",
        performedBy: "user-99",
        httpMethod: "POST",
        startDate: "2026-01-01",
        endDate: "2026-01-31",
        page: 2,
        limit: 50,
      });

      expect(mockedGet).toHaveBeenCalledWith("/audit/logs", {
        params: {
          entityType: "SALE",
          entityId: "sale-5",
          action: "CONFIRM",
          performedBy: "user-99",
          httpMethod: "POST",
          startDate: "2026-01-01",
          endDate: "2026-01-31",
          page: 2,
          limit: 50,
        },
      });
    });

    it("Given only some filters are set, When findAll is called, Then only those filters are included in params", async () => {
      mockedGet.mockResolvedValue(wrapListResponse([]));

      await adapter.findAll({ entityType: "PRODUCT", page: 1 });

      expect(mockedGet).toHaveBeenCalledWith("/audit/logs", {
        params: { entityType: "PRODUCT", page: 1 },
      });
    });
  });

  describe("findById", () => {
    it("Given an audit log exists, When findById is called, Then it returns the mapped AuditLog domain entity", async () => {
      const dto = buildAuditLogDto({
        id: "log-42",
        entityType: "WAREHOUSE",
        action: "DELETE",
        httpMethod: "DELETE",
        httpStatusCode: 200,
      });
      mockedGet.mockResolvedValue(wrapDetailResponse(dto));

      const result = await adapter.findById("log-42");

      expect(mockedGet).toHaveBeenCalledWith("/audit/logs/log-42");
      expect(result).toBeInstanceOf(AuditLog);
      expect(result!.id).toBe("log-42");
    });

    it("Given the audit log does not exist, When findById is called, Then it returns null", async () => {
      mockedGet.mockRejectedValue({ response: { status: 404 } });

      const result = await adapter.findById("nonexistent");

      expect(result).toBeNull();
    });

    it("Given a non-404 error occurs, When findById is called, Then it rethrows the error", async () => {
      mockedGet.mockRejectedValue(new Error("Internal server error"));

      await expect(adapter.findById("log-1")).rejects.toThrow(
        "Internal server error",
      );
    });
  });

  describe("findAll with empty data", () => {
    it("Given no audit logs exist, When findAll is called, Then it returns an empty data array with pagination", async () => {
      mockedGet.mockResolvedValue(
        wrapListResponse([], {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        }),
      );

      const result = await adapter.findAll();

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe("findAll with pagination metadata", () => {
    it("Given multiple pages of data exist, When findAll requests page 2, Then pagination reflects hasNext/hasPrev", async () => {
      const dto = buildAuditLogDto({ id: "log-21" });
      mockedGet.mockResolvedValue(
        wrapListResponse([dto], {
          page: 2,
          limit: 20,
          total: 50,
          totalPages: 3,
          hasNext: true,
          hasPrev: true,
        }),
      );

      const result = await adapter.findAll({ page: 2, limit: 20 });

      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(true);
      expect(result.pagination.totalPages).toBe(3);
    });
  });
});
