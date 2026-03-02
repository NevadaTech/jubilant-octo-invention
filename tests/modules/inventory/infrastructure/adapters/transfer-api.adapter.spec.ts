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

vi.mock("@/modules/inventory/application/mappers/transfer.mapper", () => ({
  TransferMapper: {
    toDomain: vi.fn((dto: unknown) => dto),
    fromApiRaw: vi.fn((dto: unknown) => dto),
  },
}));

import { apiClient } from "@/shared/infrastructure/http";
import { TransferApiAdapter } from "@/modules/inventory/infrastructure/adapters/transfer-api.adapter";
import type {
  TransferApiRawDto,
  TransferResponseDto,
  TransferListResponseDto,
} from "@/modules/inventory/application/dto/transfer.dto";

describe("TransferApiAdapter", () => {
  let adapter: TransferApiAdapter;

  const mockTransferRawDto: TransferApiRawDto = {
    id: "tr-001",
    fromWarehouseId: "wh-001",
    fromWarehouseName: "Origin Warehouse",
    toWarehouseId: "wh-002",
    toWarehouseName: "Destination Warehouse",
    status: "DRAFT",
    note: "Test transfer",
    linesCount: 1,
    totalQuantity: 50,
    lines: [
      {
        id: "tl-001",
        productId: "prod-001",
        productName: "Widget A",
        productSku: "WDG-001",
        quantity: 50,
        receivedQuantity: null,
      },
    ],
    createdBy: "user-001",
    createdAt: "2025-01-15T10:00:00.000Z",
    updatedAt: "2025-01-16T12:00:00.000Z",
  };

  const mockTransferDetailDto: TransferResponseDto = {
    id: "tr-001",
    fromWarehouseId: "wh-001",
    fromWarehouseName: "Origin Warehouse",
    toWarehouseId: "wh-002",
    toWarehouseName: "Destination Warehouse",
    status: "DRAFT",
    note: "Test transfer",
    linesCount: 1,
    lines: [
      {
        id: "tl-001",
        productId: "prod-001",
        productName: "Widget A",
        productSku: "WDG-001",
        quantity: 50,
        receivedQuantity: null,
      },
    ],
    createdBy: "user-001",
    createdAt: "2025-01-15T10:00:00.000Z",
  };

  const mockPagination = {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new TransferApiAdapter();
  });

  describe("findAll", () => {
    it("Given: no filters When: findAll is called Then: should GET /inventory/transfers with empty params", async () => {
      const listResponse: TransferListResponseDto = {
        data: [mockTransferRawDto],
        pagination: mockPagination,
      };
      vi.mocked(apiClient.get).mockResolvedValue({
        data: listResponse,
        status: 200,
        headers: {},
      });

      const result = await adapter.findAll();

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/transfers", {
        params: {},
      });
      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual(mockPagination);
    });

    it("Given: warehouse and status filters When: findAll is called Then: should join array params with commas", async () => {
      const listResponse: TransferListResponseDto = {
        data: [],
        pagination: mockPagination,
      };
      vi.mocked(apiClient.get).mockResolvedValue({
        data: listResponse,
        status: 200,
        headers: {},
      });

      await adapter.findAll({
        fromWarehouseIds: ["wh-001", "wh-003"],
        toWarehouseIds: ["wh-002"],
        status: ["DRAFT", "IN_TRANSIT"],
        search: "test",
        page: 1,
        limit: 10,
      });

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/transfers", {
        params: {
          fromWarehouseId: "wh-001,wh-003",
          toWarehouseId: "wh-002",
          status: "DRAFT,IN_TRANSIT",
          search: "test",
          page: 1,
          limit: 10,
        },
      });
    });

    it("Given: API response with null data When: findAll is called Then: should default to empty array", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: null, pagination: mockPagination },
        status: 200,
        headers: {},
      });

      const result = await adapter.findAll();

      expect(result.data).toHaveLength(0);
    });
  });

  describe("findById", () => {
    it("Given: a valid transfer ID When: findById is called Then: should return the mapped transfer", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockTransferDetailDto },
        status: 200,
        headers: {},
      });

      const result = await adapter.findById("tr-001");

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/transfers/tr-001");
      expect(result).toBeTruthy();
    });

    it("Given: a non-existent transfer ID When: findById is called Then: should return null on 404", async () => {
      vi.mocked(apiClient.get).mockRejectedValue({
        response: { status: 404 },
      });

      const result = await adapter.findById("non-existent");

      expect(result).toBeNull();
    });

    it("Given: an API error other than 404 When: findById is called Then: should rethrow the error", async () => {
      const serverError = new Error("Server Error");
      vi.mocked(apiClient.get).mockRejectedValue(serverError);

      await expect(adapter.findById("tr-001")).rejects.toThrow("Server Error");
    });
  });

  describe("create", () => {
    it("Given: valid create data When: create is called Then: should POST and return mapped transfer", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: mockTransferDetailDto },
        status: 201,
        headers: {},
      });

      const createDto = {
        fromWarehouseId: "wh-001",
        toWarehouseId: "wh-002",
        note: "Test transfer",
        lines: [{ productId: "prod-001", quantity: 50 }],
      };
      const result = await adapter.create(createDto);

      expect(apiClient.post).toHaveBeenCalledWith("/inventory/transfers", createDto);
      expect(result).toBeTruthy();
    });
  });

  describe("updateStatus", () => {
    it("Given: IN_TRANSIT status When: updateStatus is called Then: should POST to /confirm endpoint", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: { ...mockTransferDetailDto, status: "IN_TRANSIT" } },
        status: 200,
        headers: {},
      });

      const result = await adapter.updateStatus("tr-001", "IN_TRANSIT");

      expect(apiClient.post).toHaveBeenCalledWith("/inventory/transfers/tr-001/confirm");
      expect(result).toBeTruthy();
    });

    it("Given: REJECTED status When: updateStatus is called Then: should POST to /reject endpoint", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: { ...mockTransferDetailDto, status: "REJECTED" } },
        status: 200,
        headers: {},
      });

      await adapter.updateStatus("tr-001", "REJECTED");

      expect(apiClient.post).toHaveBeenCalledWith("/inventory/transfers/tr-001/reject");
    });

    it("Given: CANCELED status When: updateStatus is called Then: should POST to /cancel endpoint", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: { ...mockTransferDetailDto, status: "CANCELED" } },
        status: 200,
        headers: {},
      });

      await adapter.updateStatus("tr-001", "CANCELED");

      expect(apiClient.post).toHaveBeenCalledWith("/inventory/transfers/tr-001/cancel");
    });

    it("Given: an unmapped status When: updateStatus is called Then: should throw an error", async () => {
      await expect(adapter.updateStatus("tr-001", "DRAFT")).rejects.toThrow(
        "No endpoint defined for status transition: DRAFT",
      );
    });
  });

  describe("receive", () => {
    it("Given: valid receive data When: receive is called Then: should POST to /receive endpoint", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: { ...mockTransferDetailDto, status: "RECEIVED" } },
        status: 200,
        headers: {},
      });

      const receiveDto = {
        lines: [{ lineId: "tl-001", receivedQuantity: 50 }],
      };
      const result = await adapter.receive("tr-001", receiveDto);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/inventory/transfers/tr-001/receive",
        receiveDto,
      );
      expect(result).toBeTruthy();
    });
  });
});
