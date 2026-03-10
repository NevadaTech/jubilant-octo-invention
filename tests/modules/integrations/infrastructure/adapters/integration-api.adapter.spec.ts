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

vi.mock(
  "@/modules/integrations/application/mappers/integration-connection.mapper",
  () => ({
    IntegrationConnectionMapper: {
      toDomain: vi.fn((dto: unknown) => dto),
    },
  }),
);

vi.mock(
  "@/modules/integrations/application/mappers/integration-sync-log.mapper",
  () => ({
    IntegrationSyncLogMapper: {
      toDomain: vi.fn((dto: unknown) => dto),
    },
  }),
);

import { apiClient } from "@/shared/infrastructure/http";
import { IntegrationApiAdapter } from "@/modules/integrations/infrastructure/adapters/integration-api.adapter";
import type { IntegrationConnectionResponseDto } from "@/modules/integrations/application/dto/integration-connection.dto";
import type { IntegrationSyncLogResponseDto } from "@/modules/integrations/application/dto/integration-sync-log.dto";

describe("IntegrationApiAdapter", () => {
  let adapter: IntegrationApiAdapter;

  const mockConnectionDto: IntegrationConnectionResponseDto = {
    id: "conn-001",
    provider: "VTEX",
    accountName: "my-store",
    storeName: "My Store",
    status: "CONNECTED",
    syncStrategy: "WEBHOOK",
    syncDirection: "INBOUND",
    defaultWarehouseId: "wh-001",
    warehouseName: "Main Warehouse",
    defaultContactId: "contact-001",
    defaultContactName: "Default Customer",
    companyId: null,
    companyName: null,
    connectedAt: "2026-03-06T08:00:00.000Z",
    lastSyncAt: "2026-03-07T09:00:00.000Z",
    lastSyncError: null,
    syncedOrdersCount: 42,
    createdAt: "2026-03-05T10:00:00.000Z",
    updatedAt: "2026-03-07T12:00:00.000Z",
  };

  const mockSyncLogDto: IntegrationSyncLogResponseDto = {
    id: "log-001",
    connectionId: "conn-001",
    externalOrderId: "VTEX-ORD-12345",
    action: "CREATED",
    saleId: "sale-001",
    contactId: "contact-001",
    errorMessage: null,
    processedAt: "2026-03-07T10:00:00.000Z",
  };

  const mockPagination = {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new IntegrationApiAdapter();
  });

  describe("findAll", () => {
    it("Given: no filters When: findAll is called Then: should GET /integrations with empty params", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "Connections retrieved",
          data: [mockConnectionDto],
          timestamp: new Date().toISOString(),
        },
      });

      const result = await adapter.findAll();

      expect(apiClient.get).toHaveBeenCalledWith("/integrations/connections", {
        params: {},
      });
      expect(result).toHaveLength(1);
    });

    it("Given: provider filter When: findAll is called Then: should pass provider param", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "ok",
          data: [],
          timestamp: new Date().toISOString(),
        },
      });

      await adapter.findAll({ provider: "VTEX" });

      expect(apiClient.get).toHaveBeenCalledWith("/integrations/connections", {
        params: { provider: "VTEX" },
      });
    });

    it("Given: status filter When: findAll is called Then: should pass status param", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "ok",
          data: [],
          timestamp: new Date().toISOString(),
        },
      });

      await adapter.findAll({ status: "ERROR" });

      expect(apiClient.get).toHaveBeenCalledWith("/integrations/connections", {
        params: { status: "ERROR" },
      });
    });

    it("Given: provider and status filters When: findAll is called Then: should pass both params", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "ok",
          data: [],
          timestamp: new Date().toISOString(),
        },
      });

      await adapter.findAll({ provider: "VTEX", status: "CONNECTED" });

      expect(apiClient.get).toHaveBeenCalledWith("/integrations/connections", {
        params: { provider: "VTEX", status: "CONNECTED" },
      });
    });
  });

  describe("findById", () => {
    it("Given: a valid ID When: findById is called Then: should return the mapped connection", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "ok",
          data: mockConnectionDto,
          timestamp: new Date().toISOString(),
        },
      });

      const result = await adapter.findById("conn-001");

      expect(apiClient.get).toHaveBeenCalledWith("/integrations/connections/conn-001");
      expect(result).toBeTruthy();
    });

    it("Given: a non-existent ID When: findById is called Then: should return null on 404", async () => {
      vi.mocked(apiClient.get).mockRejectedValue({
        response: { status: 404 },
      });

      const result = await adapter.findById("non-existent");

      expect(result).toBeNull();
    });

    it("Given: a server error When: findById is called Then: should rethrow the error", async () => {
      const serverError = new Error("Internal Server Error");
      vi.mocked(apiClient.get).mockRejectedValue(serverError);

      await expect(adapter.findById("conn-001")).rejects.toThrow(
        "Internal Server Error",
      );
    });
  });

  describe("create", () => {
    it("Given: valid create data When: create is called Then: should POST and return mapped connection", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          message: "Created",
          data: mockConnectionDto,
          timestamp: new Date().toISOString(),
        },
      });

      const createDto = {
        provider: "VTEX" as const,
        accountName: "my-store",
        storeName: "My Store",
        appKey: "vtexappkey-my-store",
        appToken: "some-secret-token",
        syncStrategy: "WEBHOOK" as const,
        syncDirection: "INBOUND" as const,
        defaultWarehouseId: "wh-001",
      };
      const result = await adapter.create(createDto);

      expect(apiClient.post).toHaveBeenCalledWith("/integrations/connections", createDto);
      expect(result).toBeTruthy();
    });
  });

  describe("update", () => {
    it("Given: valid update data When: update is called Then: should PUT and return mapped connection", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({
        data: {
          success: true,
          message: "Updated",
          data: { ...mockConnectionDto, storeName: "Updated Store" },
          timestamp: new Date().toISOString(),
        },
      });

      const result = await adapter.update("conn-001", {
        storeName: "Updated Store",
      });

      expect(apiClient.put).toHaveBeenCalledWith("/integrations/connections/conn-001", {
        storeName: "Updated Store",
      });
      expect(result).toBeTruthy();
    });
  });

  describe("delete", () => {
    it("Given: a valid ID When: delete is called Then: should DELETE the connection", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: undefined });

      await adapter.delete("conn-001");

      expect(apiClient.delete).toHaveBeenCalledWith("/integrations/connections/conn-001");
    });
  });

  describe("testConnection", () => {
    it("Given: a valid ID When: testConnection is called Then: should POST to test endpoint", async () => {
      const testResponse = {
        success: true,
        message: "Connection is healthy",
        timestamp: new Date().toISOString(),
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: testResponse });

      const result = await adapter.testConnection("conn-001");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/integrations/connections/conn-001/test",
      );
      expect(result.success).toBe(true);
      expect(result.message).toBe("Connection is healthy");
    });

    it("Given: a failing connection When: testConnection is called Then: should return failure response", async () => {
      const testResponse = {
        success: false,
        message: "Authentication failed",
        timestamp: new Date().toISOString(),
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: testResponse });

      const result = await adapter.testConnection("conn-001");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Authentication failed");
    });
  });

  describe("triggerSync", () => {
    it("Given: a valid ID When: triggerSync is called Then: should POST to sync endpoint", async () => {
      const syncResponse = {
        success: true,
        message: "Sync triggered successfully",
        timestamp: new Date().toISOString(),
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: syncResponse });

      const result = await adapter.triggerSync("conn-001");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/integrations/connections/conn-001/sync",
      );
      expect(result.success).toBe(true);
      expect(result.message).toBe("Sync triggered successfully");
    });
  });

  describe("getSyncLogs", () => {
    it("Given: no filters When: getSyncLogs is called Then: should GET logs with empty params", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "Logs retrieved",
          data: [mockSyncLogDto],
          pagination: mockPagination,
          timestamp: new Date().toISOString(),
        },
      });

      const result = await adapter.getSyncLogs("conn-001");

      expect(apiClient.get).toHaveBeenCalledWith(
        "/integrations/connections/conn-001/logs",
        { params: {} },
      );
      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual(mockPagination);
    });

    it("Given: action filter When: getSyncLogs is called Then: should pass action param", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "ok",
          data: [],
          pagination: mockPagination,
          timestamp: new Date().toISOString(),
        },
      });

      await adapter.getSyncLogs("conn-001", { action: "FAILED" });

      expect(apiClient.get).toHaveBeenCalledWith(
        "/integrations/connections/conn-001/logs",
        { params: { action: "FAILED" } },
      );
    });

    it("Given: pagination filters When: getSyncLogs is called Then: should pass page and limit", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "ok",
          data: [],
          pagination: { ...mockPagination, page: 2, limit: 25 },
          timestamp: new Date().toISOString(),
        },
      });

      await adapter.getSyncLogs("conn-001", { page: 2, limit: 25 });

      expect(apiClient.get).toHaveBeenCalledWith(
        "/integrations/connections/conn-001/logs",
        { params: { page: 2, limit: 25 } },
      );
    });
  });

  describe("getSkuMappings", () => {
    it("Given: a connection ID When: getSkuMappings is called Then: should GET sku-mappings", async () => {
      const mockMappings = [
        {
          id: "map-001",
          connectionId: "conn-001",
          externalSku: "VTEX-SKU-001",
          productId: "prod-001",
          productName: "Widget A",
          productSku: "WA-001",
          createdAt: "2026-03-07T10:00:00.000Z",
        },
      ];
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "ok",
          data: mockMappings,
          timestamp: new Date().toISOString(),
        },
      });

      const result = await adapter.getSkuMappings("conn-001");

      expect(apiClient.get).toHaveBeenCalledWith(
        "/integrations/connections/conn-001/sku-mappings",
      );
      expect(result).toHaveLength(1);
      expect(result[0].externalSku).toBe("VTEX-SKU-001");
    });
  });

  describe("createSkuMapping", () => {
    it("Given: valid mapping data When: createSkuMapping is called Then: should POST and return mapping", async () => {
      const mockMapping = {
        id: "map-002",
        connectionId: "conn-001",
        externalSku: "VTEX-SKU-002",
        productId: "prod-002",
        createdAt: "2026-03-07T10:00:00.000Z",
      };
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          message: "Created",
          data: mockMapping,
          timestamp: new Date().toISOString(),
        },
      });

      const result = await adapter.createSkuMapping("conn-001", {
        externalSku: "VTEX-SKU-002",
        productId: "prod-002",
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        "/integrations/connections/conn-001/sku-mappings",
        { externalSku: "VTEX-SKU-002", productId: "prod-002" },
      );
      expect(result.id).toBe("map-002");
    });
  });

  describe("deleteSkuMapping", () => {
    it("Given: valid IDs When: deleteSkuMapping is called Then: should DELETE the mapping", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: undefined });

      await adapter.deleteSkuMapping("conn-001", "map-001");

      expect(apiClient.delete).toHaveBeenCalledWith(
        "/integrations/connections/conn-001/sku-mappings/map-001",
      );
    });
  });

  describe("getUnmatchedSkus", () => {
    it("Given: a connection ID When: getUnmatchedSkus is called Then: should GET unmatched-skus", async () => {
      const mockUnmatched = [
        {
          externalSku: "VTEX-SKU-999",
          externalOrderId: "VTEX-ORD-456",
          errorMessage: "No matching product found",
          processedAt: "2026-03-07T10:00:00.000Z",
        },
      ];
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "ok",
          data: mockUnmatched,
          timestamp: new Date().toISOString(),
        },
      });

      const result = await adapter.getUnmatchedSkus("conn-001");

      expect(apiClient.get).toHaveBeenCalledWith(
        "/integrations/connections/conn-001/unmatched",
      );
      expect(result).toHaveLength(1);
      expect(result[0].externalSku).toBe("VTEX-SKU-999");
    });
  });

  describe("retrySyncLog", () => {
    it("Given: valid IDs When: retrySyncLog is called Then: should POST to retry endpoint", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: undefined });

      await adapter.retrySyncLog("conn-001", "log-001");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/integrations/connections/conn-001/retry/log-001",
      );
    });
  });

  describe("retryAllFailed", () => {
    it("Given: a connection ID When: retryAllFailed is called Then: should POST to retry-all endpoint", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: undefined });

      await adapter.retryAllFailed("conn-001");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/integrations/connections/conn-001/retry-all",
      );
    });
  });
});
