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

vi.mock("@/modules/inventory/application/mappers/product.mapper", () => ({
  ProductMapper: {
    toDomain: vi.fn((dto: unknown) => dto),
  },
}));

import { apiClient } from "@/shared/infrastructure/http";
import { ProductApiAdapter } from "@/modules/inventory/infrastructure/adapters/product-api.adapter";
import type { ProductApiRawDto } from "@/modules/inventory/application/dto/product.dto";

describe("ProductApiAdapter", () => {
  let adapter: ProductApiAdapter;

  const mockProductRaw: ProductApiRawDto = {
    id: "prod-001",
    sku: "WDG-001",
    name: "Widget A",
    description: "A nice widget",
    unit: { code: "UNIT", name: "Unit", precision: 0 },
    status: "ACTIVE",
    isActive: true,
    price: 29.99,
    averageCost: 15.0,
    totalStock: 100,
    margin: 50,
    profit: 14.99,
    minStock: 10,
    maxStock: 200,
    safetyStock: 15,
    totalIn30d: 50,
    totalOut30d: 30,
    avgDailyConsumption: 1.0,
    daysOfStock: 100,
    turnoverRate: 0.3,
    lastMovementDate: null,
    categories: [{ id: "cat-001", name: "Electronics" }],
    imageUrl: null,
    createdAt: "2025-01-15T10:00:00.000Z",
    updatedAt: "2025-01-16T12:00:00.000Z",
    statusChangedBy: null,
    statusChangedAt: null,
  };

  const mockPagination = {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new ProductApiAdapter();
  });

  describe("findAll", () => {
    it("Given: no filters When: findAll is called Then: should GET /inventory/products with empty params", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: [mockProductRaw], pagination: mockPagination },
        status: 200,
        headers: {},
      });

      const result = await adapter.findAll();

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/products", {
        params: {},
      });
      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual(mockPagination);
    });

    it("Given: search and categoryIds filters When: findAll is called Then: should join categoryIds with commas", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: [], pagination: mockPagination },
        status: 200,
        headers: {},
      });

      await adapter.findAll({
        search: "widget",
        categoryIds: ["cat-001", "cat-002"],
        page: 1,
        limit: 10,
      });

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/products", {
        params: {
          search: "widget",
          categoryIds: "cat-001,cat-002",
          page: 1,
          limit: 10,
        },
      });
    });

    it("Given: single status filter When: findAll is called Then: should pass status directly", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: [], pagination: mockPagination },
        status: 200,
        headers: {},
      });

      await adapter.findAll({ statuses: ["ACTIVE"] });

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/products", {
        params: { status: "ACTIVE" },
      });
    });

    it("Given: sort parameters When: findAll is called Then: should include sortBy and sortOrder", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: [], pagination: mockPagination },
        status: 200,
        headers: {},
      });

      await adapter.findAll({ sortBy: "name", sortOrder: "asc" });

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/products", {
        params: { sortBy: "name", sortOrder: "asc" },
      });
    });
  });

  describe("findById", () => {
    it("Given: a valid product ID When: findById is called Then: should return the mapped product", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockProductRaw },
        status: 200,
        headers: {},
      });

      const result = await adapter.findById("prod-001");

      expect(apiClient.get).toHaveBeenCalledWith(
        "/inventory/products/prod-001",
      );
      expect(result).toBeTruthy();
    });

    it("Given: a non-existent product ID When: findById is called Then: should return null on 404", async () => {
      vi.mocked(apiClient.get).mockRejectedValue({
        response: { status: 404 },
      });

      const result = await adapter.findById("non-existent");

      expect(result).toBeNull();
    });

    it("Given: an API error other than 404 When: findById is called Then: should rethrow the error", async () => {
      const serverError = new Error("Server Error");
      vi.mocked(apiClient.get).mockRejectedValue(serverError);

      await expect(adapter.findById("prod-001")).rejects.toThrow(
        "Server Error",
      );
    });
  });

  describe("create", () => {
    it("Given: valid create data When: create is called Then: should POST with transformed API DTO", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: mockProductRaw },
        status: 201,
        headers: {},
      });

      const createDto = {
        sku: "WDG-001",
        name: "Widget A",
        description: "A nice widget",
        categoryIds: ["cat-001"],
        unitOfMeasure: "Unit",
        cost: 15.0,
        price: 29.99,
        minStock: 10,
        maxStock: 200,
      };
      const result = await adapter.create(createDto);

      expect(apiClient.post).toHaveBeenCalledWith("/inventory/products", {
        sku: "WDG-001",
        name: "Widget A",
        unit: { code: "UNIT", name: "Unit", precision: 0 },
        description: "A nice widget",
        categoryIds: ["cat-001"],
        price: 29.99,
      });
      expect(result).toBeTruthy();
    });

    it("Given: create data without optional description When: create is called Then: should omit description from API DTO", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: mockProductRaw },
        status: 201,
        headers: {},
      });

      const createDto = {
        sku: "WDG-002",
        name: "Widget B",
        unitOfMeasure: "Piece",
        cost: 10.0,
        price: 20.0,
        minStock: 5,
        maxStock: 50,
      };
      await adapter.create(createDto);

      const calledPayload = vi.mocked(apiClient.post).mock.calls[0][1];
      expect(calledPayload).toEqual({
        sku: "WDG-002",
        name: "Widget B",
        unit: { code: "PIECE", name: "Piece", precision: 0 },
        description: undefined,
        categoryIds: undefined,
        price: 20.0,
      });
    });
  });

  describe("update", () => {
    it("Given: valid update data with name and status change When: update is called Then: should PUT with transformed API DTO", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({
        data: { data: { ...mockProductRaw, name: "Updated Widget" } },
        status: 200,
        headers: {},
      });

      const updateDto = {
        name: "Updated Widget",
        isActive: false,
        unitOfMeasure: "Kilogram",
        price: 35.0,
      };
      const result = await adapter.update("prod-001", updateDto);

      expect(apiClient.put).toHaveBeenCalledWith(
        "/inventory/products/prod-001",
        {
          name: "Updated Widget",
          status: "INACTIVE",
          unit: { code: "KILOGRAM", name: "Kilogram", precision: 0 },
          price: 35.0,
        },
      );
      expect(result).toBeTruthy();
    });
  });
});
