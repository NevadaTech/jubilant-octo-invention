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

vi.mock("@/modules/companies/application/mappers/company.mapper", () => ({
  CompanyMapper: {
    toDomain: vi.fn((dto: unknown) => dto),
  },
}));

import { apiClient } from "@/shared/infrastructure/http";
import { CompanyApiAdapter } from "@/modules/companies/infrastructure/adapters/company-api.adapter";
import type { CompanyResponseDto } from "@/modules/companies/application/dto/company.dto";

describe("CompanyApiAdapter", () => {
  let adapter: CompanyApiAdapter;

  const mockCompanyDto: CompanyResponseDto = {
    id: "company-001",
    name: "Acme Corp",
    code: "ACME",
    description: "Main company",
    isActive: true,
    productCount: 10,
    createdAt: "2026-03-07T10:00:00.000Z",
    updatedAt: "2026-03-07T12:00:00.000Z",
  };

  const mockPagination = {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new CompanyApiAdapter();
  });

  describe("findAll", () => {
    it("Given: no filters When: findAll is called Then: should GET /inventory/companies with empty params", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          data: [mockCompanyDto],
          pagination: mockPagination,
        },
      });

      const result = await adapter.findAll();

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/companies", {
        params: {},
      });
      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual(mockPagination);
    });

    it("Given: search filter When: findAll is called Then: should pass search param", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: [], pagination: mockPagination },
      });

      await adapter.findAll({ search: "acme" });

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/companies", {
        params: { search: "acme" },
      });
    });

    it("Given: isActive filter When: findAll is called Then: should pass isActive param", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: [], pagination: mockPagination },
      });

      await adapter.findAll({ isActive: true });

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/companies", {
        params: { isActive: true },
      });
    });

    it("Given: pagination and sorting When: findAll is called Then: should pass all params", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: [], pagination: mockPagination },
      });

      await adapter.findAll({
        page: 2,
        limit: 25,
        sortBy: "name",
        sortOrder: "desc",
      });

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/companies", {
        params: {
          page: 2,
          limit: 25,
          sortBy: "name",
          sortOrder: "desc",
        },
      });
    });

    it("Given: all filters combined When: findAll is called Then: should pass all params", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: [], pagination: mockPagination },
      });

      await adapter.findAll({
        search: "test",
        isActive: false,
        page: 3,
        limit: 50,
        sortBy: "code",
        sortOrder: "asc",
      });

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/companies", {
        params: {
          search: "test",
          isActive: false,
          page: 3,
          limit: 50,
          sortBy: "code",
          sortOrder: "asc",
        },
      });
    });

    it("Given: undefined filter values When: findAll is called Then: should exclude them from params", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: [], pagination: mockPagination },
      });

      await adapter.findAll({ search: undefined, page: undefined });

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/companies", {
        params: {},
      });
    });
  });

  describe("findById", () => {
    it("Given: a valid ID When: findById is called Then: should return the mapped company", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockCompanyDto },
      });

      const result = await adapter.findById("company-001");

      expect(apiClient.get).toHaveBeenCalledWith(
        "/inventory/companies/company-001",
      );
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

      await expect(adapter.findById("company-001")).rejects.toThrow(
        "Internal Server Error",
      );
    });

    it("Given: error without response property When: findById Then: should rethrow", async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error("Network error"));

      await expect(adapter.findById("company-001")).rejects.toThrow(
        "Network error",
      );
    });
  });

  describe("create", () => {
    it("Given: valid create data When: create is called Then: should POST and return mapped company", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: mockCompanyDto },
      });

      const createDto = {
        name: "Acme Corp",
        code: "ACME",
        description: "Main company",
      };
      const result = await adapter.create(createDto);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/inventory/companies",
        createDto,
      );
      expect(result).toBeTruthy();
    });
  });

  describe("update", () => {
    it("Given: valid update data When: update is called Then: should PUT and return mapped company", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({
        data: { data: { ...mockCompanyDto, name: "Updated Corp" } },
      });

      const result = await adapter.update("company-001", {
        name: "Updated Corp",
      });

      expect(apiClient.put).toHaveBeenCalledWith(
        "/inventory/companies/company-001",
        { name: "Updated Corp" },
      );
      expect(result).toBeTruthy();
    });
  });

  describe("delete", () => {
    it("Given: a valid ID When: delete is called Then: should DELETE the company", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: undefined });

      await adapter.delete("company-001");

      expect(apiClient.delete).toHaveBeenCalledWith(
        "/inventory/companies/company-001",
      );
    });
  });
});
