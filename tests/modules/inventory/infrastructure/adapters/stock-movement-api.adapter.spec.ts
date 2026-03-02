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
  "@/modules/inventory/application/mappers/stock-movement.mapper",
  () => ({
    StockMovementMapper: {
      toDomain: vi.fn((dto: unknown) => dto),
    },
  }),
);

import { apiClient } from "@/shared/infrastructure/http";
import { StockMovementApiAdapter } from "@/modules/inventory/infrastructure/adapters/stock-movement-api.adapter";
import type {
  StockMovementResponseDto,
  StockMovementListResponseDto,
} from "@/modules/inventory/application/dto/stock-movement.dto";

describe("StockMovementApiAdapter", () => {
  let adapter: StockMovementApiAdapter;

  const mockMovementDto: StockMovementResponseDto = {
    id: "mov-001",
    warehouseId: "wh-001",
    warehouseName: "Main Warehouse",
    type: "IN",
    status: "DRAFT",
    reference: "REF-001",
    reason: "Initial stock",
    note: "First movement",
    lines: [
      {
        id: "line-001",
        productId: "prod-001",
        productName: "Widget A",
        productSku: "WDG-001",
        quantity: 50,
        unitCost: 10,
      },
    ],
    createdBy: "user-001",
    createdAt: "2025-01-15T10:00:00.000Z",
    postedAt: null,
  };

  const mockPagination = {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new StockMovementApiAdapter();
  });

  describe("findAll", () => {
    it("Given: no filters When: findAll is called Then: should GET /inventory/movements with empty params", async () => {
      const listResponse: StockMovementListResponseDto = {
        data: [mockMovementDto],
        pagination: mockPagination,
      };
      vi.mocked(apiClient.get).mockResolvedValue({
        data: listResponse,
        status: 200,
        headers: {},
      });

      const result = await adapter.findAll();

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/movements", {
        params: {},
      });
      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual(mockPagination);
    });

    it("Given: multiple filters When: findAll is called Then: should join array params with commas", async () => {
      const listResponse: StockMovementListResponseDto = {
        data: [],
        pagination: mockPagination,
      };
      vi.mocked(apiClient.get).mockResolvedValue({
        data: listResponse,
        status: 200,
        headers: {},
      });

      await adapter.findAll({
        warehouseIds: ["wh-001", "wh-002"],
        types: ["IN", "OUT"],
        status: ["DRAFT", "POSTED"],
        productId: "prod-001",
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        search: "widget",
        page: 1,
        limit: 10,
      });

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/movements", {
        params: {
          warehouseId: "wh-001,wh-002",
          type: "IN,OUT",
          status: "DRAFT,POSTED",
          productId: "prod-001",
          startDate: "2025-01-01",
          endDate: "2025-01-31",
          search: "widget",
          page: 1,
          limit: 10,
        },
      });
    });
  });

  describe("findById", () => {
    it("Given: a valid movement ID When: findById is called Then: should return the mapped movement", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockMovementDto },
        status: 200,
        headers: {},
      });

      const result = await adapter.findById("mov-001");

      expect(apiClient.get).toHaveBeenCalledWith(
        "/inventory/movements/mov-001",
      );
      expect(result).toBeTruthy();
    });

    it("Given: a non-existent movement ID When: findById is called Then: should return null on 404", async () => {
      vi.mocked(apiClient.get).mockRejectedValue({
        response: { status: 404 },
      });

      const result = await adapter.findById("non-existent");

      expect(result).toBeNull();
    });

    it("Given: an API error other than 404 When: findById is called Then: should rethrow the error", async () => {
      const serverError = new Error("Server Error");
      vi.mocked(apiClient.get).mockRejectedValue(serverError);

      await expect(adapter.findById("mov-001")).rejects.toThrow("Server Error");
    });
  });

  describe("create", () => {
    it("Given: valid create data When: create is called Then: should POST and return mapped movement", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: mockMovementDto },
        status: 201,
        headers: {},
      });

      const createDto = {
        warehouseId: "wh-001",
        type: "IN" as const,
        reference: "REF-001",
        lines: [{ productId: "prod-001", quantity: 50, unitCost: 10 }],
      };
      const result = await adapter.create(createDto);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/inventory/movements",
        createDto,
      );
      expect(result).toBeTruthy();
    });
  });

  describe("update", () => {
    it("Given: valid update data When: update is called Then: should PATCH and return mapped movement", async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({
        data: { data: { ...mockMovementDto, note: "Updated note" } },
        status: 200,
        headers: {},
      });

      const updateDto = { note: "Updated note" };
      const result = await adapter.update("mov-001", updateDto);

      expect(apiClient.patch).toHaveBeenCalledWith(
        "/inventory/movements/mov-001",
        updateDto,
      );
      expect(result).toBeTruthy();
    });
  });

  describe("delete", () => {
    it("Given: a valid movement ID When: delete is called Then: should DELETE /inventory/movements/:id", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        data: undefined,
        status: 204,
        headers: {},
      });

      await adapter.delete("mov-001");

      expect(apiClient.delete).toHaveBeenCalledWith(
        "/inventory/movements/mov-001",
      );
    });
  });

  describe("post", () => {
    it("Given: a valid movement ID When: post is called Then: should POST to /inventory/movements/:id/post", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: undefined,
        status: 200,
        headers: {},
      });

      await adapter.post("mov-001");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/inventory/movements/mov-001/post",
      );
    });
  });

  describe("void", () => {
    it("Given: a valid movement ID When: void is called Then: should POST to /inventory/movements/:id/void", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: undefined,
        status: 200,
        headers: {},
      });

      await adapter.void("mov-001");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/inventory/movements/mov-001/void",
      );
    });
  });
});
