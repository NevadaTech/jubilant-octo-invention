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

vi.mock("@/modules/inventory/application/mappers/stock.mapper", () => ({
  StockMapper: {
    toDomain: vi.fn((dto: unknown) => dto),
  },
}));

import { apiClient } from "@/shared/infrastructure/http";
import { StockApiAdapter } from "@/modules/inventory/infrastructure/adapters/stock-api.adapter";
import type { StockApiRawDto } from "@/modules/inventory/application/dto/stock.dto";

describe("StockApiAdapter", () => {
  let adapter: StockApiAdapter;

  const mockStockItem: StockApiRawDto = {
    productId: "prod-001",
    warehouseId: "wh-001",
    quantity: 100,
    averageCost: 15.5,
    totalValue: 1550,
    currency: "USD",
    productName: "Widget A",
    productSku: "WDG-001",
    warehouseName: "Main Warehouse",
    reservedQuantity: 10,
    availableQuantity: 90,
  };

  const mockPagination = {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new StockApiAdapter();
  });

  describe("findAll", () => {
    it("Given: no filters When: findAll is called Then: should GET /inventory/stock with empty params", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: [mockStockItem], pagination: mockPagination },
        status: 200,
        headers: {},
      });

      const result = await adapter.findAll();

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/stock", {
        params: {},
      });
      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual(mockPagination);
    });

    it("Given: warehouseIds and search filters When: findAll is called Then: should pass comma-joined warehouseId", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: [], pagination: mockPagination },
        status: 200,
        headers: {},
      });

      await adapter.findAll({
        warehouseIds: ["wh-001", "wh-002"],
        search: "widget",
      });

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/stock", {
        params: { warehouseId: "wh-001,wh-002", search: "widget" },
      });
    });

    it("Given: productId and lowStock filters When: findAll is called Then: should include them in params", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: [], pagination: mockPagination },
        status: 200,
        headers: {},
      });

      await adapter.findAll({
        productId: "prod-001",
        lowStock: true,
        page: 1,
        limit: 10,
      });

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/stock", {
        params: { productId: "prod-001", lowStock: true, page: 1, limit: 10 },
      });
    });

    it("Given: API response without pagination When: findAll is called Then: should provide fallback pagination", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: [mockStockItem] },
        status: 200,
        headers: {},
      });

      const result = await adapter.findAll({ page: 3, limit: 15 });

      expect(result.pagination).toEqual({
        page: 3,
        limit: 15,
        total: 1,
        totalPages: 1,
      });
    });

    it("Given: API response with null data When: findAll is called Then: should default to empty array", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: null },
        status: 200,
        headers: {},
      });

      const result = await adapter.findAll();

      expect(result.data).toHaveLength(0);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
      });
    });
  });

  describe("findByProductAndWarehouse", () => {
    it("Given: valid productId and warehouseId When: findByProductAndWarehouse is called Then: should return mapped stock", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockStockItem },
        status: 200,
        headers: {},
      });

      const result = await adapter.findByProductAndWarehouse(
        "prod-001",
        "wh-001",
      );

      expect(apiClient.get).toHaveBeenCalledWith(
        "/inventory/stock/product/prod-001/warehouse/wh-001",
      );
      expect(result).toBeTruthy();
    });

    it("Given: a non-existent stock record When: findByProductAndWarehouse is called Then: should return null on 404", async () => {
      vi.mocked(apiClient.get).mockRejectedValue({
        response: { status: 404 },
      });

      const result = await adapter.findByProductAndWarehouse(
        "prod-999",
        "wh-999",
      );

      expect(result).toBeNull();
    });

    it("Given: an API error other than 404 When: findByProductAndWarehouse is called Then: should rethrow the error", async () => {
      const serverError = new Error("Server Error");
      vi.mocked(apiClient.get).mockRejectedValue(serverError);

      await expect(
        adapter.findByProductAndWarehouse("prod-001", "wh-001"),
      ).rejects.toThrow("Server Error");
    });
  });
});
