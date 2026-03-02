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

vi.mock("@/modules/inventory/application/mappers/category.mapper", () => ({
  CategoryMapper: {
    toDomain: vi.fn((dto: unknown) => dto),
  },
}));

import { apiClient } from "@/shared/infrastructure/http";
import { CategoryApiAdapter } from "@/modules/inventory/infrastructure/adapters/category-api.adapter";
import type {
  CategoryResponseDto,
  CategoryListResponseDto,
} from "@/modules/inventory/application/dto/category.dto";

describe("CategoryApiAdapter", () => {
  let adapter: CategoryApiAdapter;

  const mockCategoryDto: CategoryResponseDto = {
    id: "cat-001",
    name: "Electronics",
    description: "Electronic products",
    parentId: null,
    parentName: null,
    isActive: true,
    productCount: 10,
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
    adapter = new CategoryApiAdapter();
  });

  describe("findAll", () => {
    it("Given: no filters When: findAll is called Then: should GET /inventory/categories with empty params", async () => {
      const listResponse: CategoryListResponseDto = {
        data: [mockCategoryDto],
        pagination: mockPagination,
      };
      vi.mocked(apiClient.get).mockResolvedValue({
        data: listResponse,
        status: 200,
        headers: {},
      });

      const result = await adapter.findAll();

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/categories", {
        params: {},
      });
      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual(mockPagination);
    });

    it("Given: search and pagination filters When: findAll is called Then: should pass query params correctly", async () => {
      const listResponse: CategoryListResponseDto = {
        data: [],
        pagination: { page: 2, limit: 10, total: 0, totalPages: 0 },
      };
      vi.mocked(apiClient.get).mockResolvedValue({
        data: listResponse,
        status: 200,
        headers: {},
      });

      await adapter.findAll({ search: "elec", page: 2, limit: 10 });

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/categories", {
        params: { search: "elec", page: 2, limit: 10 },
      });
    });

    it("Given: parentId filter When: findAll is called Then: should include parentId in params", async () => {
      const listResponse: CategoryListResponseDto = {
        data: [],
        pagination: mockPagination,
      };
      vi.mocked(apiClient.get).mockResolvedValue({
        data: listResponse,
        status: 200,
        headers: {},
      });

      await adapter.findAll({ parentId: "parent-001" });

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/categories", {
        params: { parentId: "parent-001" },
      });
    });

    it("Given: statuses filter with single ACTIVE status When: findAll is called Then: should set isActive=true", async () => {
      const listResponse: CategoryListResponseDto = {
        data: [],
        pagination: mockPagination,
      };
      vi.mocked(apiClient.get).mockResolvedValue({
        data: listResponse,
        status: 200,
        headers: {},
      });

      await adapter.findAll({ statuses: ["ACTIVE"] });

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/categories", {
        params: { isActive: true },
      });
    });

    it("Given: statuses filter with single INACTIVE status When: findAll is called Then: should set isActive=false", async () => {
      const listResponse: CategoryListResponseDto = {
        data: [],
        pagination: mockPagination,
      };
      vi.mocked(apiClient.get).mockResolvedValue({
        data: listResponse,
        status: 200,
        headers: {},
      });

      await adapter.findAll({ statuses: ["INACTIVE"] });

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/categories", {
        params: { isActive: false },
      });
    });
  });

  describe("findById", () => {
    it("Given: a valid category ID When: findById is called Then: should return the mapped category", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockCategoryDto },
        status: 200,
        headers: {},
      });

      const result = await adapter.findById("cat-001");

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/categories/cat-001");
      expect(result).toBeTruthy();
    });

    it("Given: a non-existent category ID When: findById is called Then: should return null on 404", async () => {
      vi.mocked(apiClient.get).mockRejectedValue({
        response: { status: 404 },
      });

      const result = await adapter.findById("non-existent");

      expect(result).toBeNull();
    });

    it("Given: an API error other than 404 When: findById is called Then: should rethrow the error", async () => {
      const serverError = new Error("Internal Server Error");
      vi.mocked(apiClient.get).mockRejectedValue(serverError);

      await expect(adapter.findById("cat-001")).rejects.toThrow("Internal Server Error");
    });
  });

  describe("create", () => {
    it("Given: valid create data When: create is called Then: should POST to /inventory/categories and return mapped category", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: mockCategoryDto },
        status: 201,
        headers: {},
      });

      const createDto = { name: "Electronics", description: "Electronic products" };
      const result = await adapter.create(createDto);

      expect(apiClient.post).toHaveBeenCalledWith("/inventory/categories", createDto);
      expect(result).toBeTruthy();
    });
  });

  describe("update", () => {
    it("Given: valid update data When: update is called Then: should PUT to /inventory/categories/:id and return mapped category", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({
        data: { data: { ...mockCategoryDto, name: "Updated Electronics" } },
        status: 200,
        headers: {},
      });

      const updateDto = { name: "Updated Electronics" };
      const result = await adapter.update("cat-001", updateDto);

      expect(apiClient.put).toHaveBeenCalledWith("/inventory/categories/cat-001", updateDto);
      expect(result).toBeTruthy();
    });
  });

  describe("delete", () => {
    it("Given: a valid category ID When: delete is called Then: should DELETE /inventory/categories/:id", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        data: undefined,
        status: 204,
        headers: {},
      });

      await adapter.delete("cat-001");

      expect(apiClient.delete).toHaveBeenCalledWith("/inventory/categories/cat-001");
    });
  });
});
