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

vi.mock("@/modules/inventory/application/mappers/warehouse.mapper", () => ({
  WarehouseMapper: {
    toDomain: vi.fn((dto: unknown) => dto),
  },
}));

import { apiClient } from "@/shared/infrastructure/http";
import { WarehouseApiAdapter } from "@/modules/inventory/infrastructure/adapters/warehouse-api.adapter";
import type {
  WarehouseResponseDto,
  WarehouseListResponseDto,
} from "@/modules/inventory/application/dto/warehouse.dto";

describe("WarehouseApiAdapter", () => {
  let adapter: WarehouseApiAdapter;

  const mockWarehouseDto: WarehouseResponseDto = {
    id: "wh-001",
    code: "WH-MAIN",
    name: "Main Warehouse",
    address: "123 Main St",
    isActive: true,
    createdAt: "2025-01-15T10:00:00.000Z",
    updatedAt: "2025-01-16T12:00:00.000Z",
  };

  const mockPagination = {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new WarehouseApiAdapter();
  });

  describe("findAll", () => {
    it("Given: no filters When: findAll is called Then: should GET /inventory/warehouses with empty params", async () => {
      const listResponse: WarehouseListResponseDto = {
        data: [mockWarehouseDto],
        pagination: mockPagination,
      };
      vi.mocked(apiClient.get).mockResolvedValue({
        data: listResponse,
        status: 200,
        headers: {},
      });

      const result = await adapter.findAll();

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/warehouses", {
        params: {},
      });
      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual(mockPagination);
    });

    it("Given: search and pagination filters When: findAll is called Then: should pass query params correctly", async () => {
      const listResponse: WarehouseListResponseDto = {
        data: [],
        pagination: { page: 2, limit: 10, total: 0, totalPages: 0 },
      };
      vi.mocked(apiClient.get).mockResolvedValue({
        data: listResponse,
        status: 200,
        headers: {},
      });

      await adapter.findAll({ search: "main", page: 2, limit: 10 });

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/warehouses", {
        params: { search: "main", page: 2, limit: 10 },
      });
    });

    it("Given: statuses filter with single ACTIVE status When: findAll is called Then: should set isActive=true", async () => {
      const listResponse: WarehouseListResponseDto = {
        data: [],
        pagination: mockPagination,
      };
      vi.mocked(apiClient.get).mockResolvedValue({
        data: listResponse,
        status: 200,
        headers: {},
      });

      await adapter.findAll({ statuses: ["ACTIVE"] });

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/warehouses", {
        params: { isActive: true },
      });
    });
  });

  describe("findById", () => {
    it("Given: a valid warehouse ID When: findById is called Then: should return the mapped warehouse", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockWarehouseDto },
        status: 200,
        headers: {},
      });

      const result = await adapter.findById("wh-001");

      expect(apiClient.get).toHaveBeenCalledWith(
        "/inventory/warehouses/wh-001",
      );
      expect(result).toBeTruthy();
    });

    it("Given: a non-existent warehouse ID When: findById is called Then: should return null on 404", async () => {
      vi.mocked(apiClient.get).mockRejectedValue({
        response: { status: 404 },
      });

      const result = await adapter.findById("non-existent");

      expect(result).toBeNull();
    });

    it("Given: an API error other than 404 When: findById is called Then: should rethrow the error", async () => {
      const serverError = new Error("Server Error");
      vi.mocked(apiClient.get).mockRejectedValue(serverError);

      await expect(adapter.findById("wh-001")).rejects.toThrow("Server Error");
    });
  });

  describe("create", () => {
    it("Given: valid create data When: create is called Then: should POST and return mapped warehouse", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: mockWarehouseDto },
        status: 201,
        headers: {},
      });

      const createDto = {
        code: "WH-MAIN",
        name: "Main Warehouse",
        address: "123 Main St",
      };
      const result = await adapter.create(createDto);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/inventory/warehouses",
        createDto,
      );
      expect(result).toBeTruthy();
    });
  });

  describe("update", () => {
    it("Given: valid update data When: update is called Then: should PUT and return mapped warehouse", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({
        data: { data: { ...mockWarehouseDto, name: "Updated Warehouse" } },
        status: 200,
        headers: {},
      });

      const updateDto = { name: "Updated Warehouse" };
      const result = await adapter.update("wh-001", updateDto);

      expect(apiClient.put).toHaveBeenCalledWith(
        "/inventory/warehouses/wh-001",
        updateDto,
      );
      expect(result).toBeTruthy();
    });
  });
});
