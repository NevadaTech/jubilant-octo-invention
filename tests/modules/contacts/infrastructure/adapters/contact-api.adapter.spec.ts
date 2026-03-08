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

vi.mock("@/modules/contacts/application/mappers/contact.mapper", () => ({
  ContactMapper: {
    toDomain: vi.fn((dto: unknown) => dto),
  },
}));

import { apiClient } from "@/shared/infrastructure/http";
import { ContactApiAdapter } from "@/modules/contacts/infrastructure/adapters/contact-api.adapter";
import type { ContactResponseDto } from "@/modules/contacts/application/dto/contact.dto";

describe("ContactApiAdapter", () => {
  let adapter: ContactApiAdapter;

  const mockContactDto: ContactResponseDto = {
    id: "contact-001",
    name: "John Doe",
    identification: "12345678-9",
    type: "CUSTOMER",
    address: "123 Main St",
    notes: null,
    isActive: true,
    salesCount: 2,
    createdAt: "2026-03-07T10:00:00.000Z",
    updatedAt: "2026-03-07T12:00:00.000Z",
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
    adapter = new ContactApiAdapter();
  });

  describe("findAll", () => {
    it("Given: no filters When: findAll is called Then: should GET /contacts with empty params", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "Contacts retrieved",
          data: [mockContactDto],
          pagination: mockPagination,
          timestamp: new Date().toISOString(),
        },
      });

      const result = await adapter.findAll();

      expect(apiClient.get).toHaveBeenCalledWith("/contacts", { params: {} });
      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual(mockPagination);
    });

    it("Given: search filter When: findAll is called Then: should pass search param", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "ok",
          data: [],
          pagination: mockPagination,
          timestamp: new Date().toISOString(),
        },
      });

      await adapter.findAll({ search: "john" });

      expect(apiClient.get).toHaveBeenCalledWith("/contacts", {
        params: { search: "john" },
      });
    });

    it("Given: type filter When: findAll is called Then: should pass type param", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "ok",
          data: [],
          pagination: mockPagination,
          timestamp: new Date().toISOString(),
        },
      });

      await adapter.findAll({ type: "SUPPLIER" });

      expect(apiClient.get).toHaveBeenCalledWith("/contacts", {
        params: { type: "SUPPLIER" },
      });
    });

    it("Given: pagination and sorting When: findAll is called Then: should pass all params", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "ok",
          data: [],
          pagination: mockPagination,
          timestamp: new Date().toISOString(),
        },
      });

      await adapter.findAll({
        page: 2,
        limit: 25,
        sortBy: "name",
        sortOrder: "desc",
        isActive: true,
      });

      expect(apiClient.get).toHaveBeenCalledWith("/contacts", {
        params: {
          page: 2,
          limit: 25,
          sortBy: "name",
          sortOrder: "desc",
          isActive: true,
        },
      });
    });
  });

  describe("findById", () => {
    it("Given: a valid ID When: findById is called Then: should return the mapped contact", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "ok",
          data: mockContactDto,
          timestamp: new Date().toISOString(),
        },
      });

      const result = await adapter.findById("contact-001");

      expect(apiClient.get).toHaveBeenCalledWith("/contacts/contact-001");
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

      await expect(adapter.findById("contact-001")).rejects.toThrow(
        "Internal Server Error",
      );
    });
  });

  describe("create", () => {
    it("Given: valid create data When: create is called Then: should POST and return mapped contact", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          message: "Created",
          data: mockContactDto,
          timestamp: new Date().toISOString(),
        },
      });

      const createDto = {
        name: "John Doe",
        identification: "12345678-9",
        type: "CUSTOMER" as const,
      };
      const result = await adapter.create(createDto);

      expect(apiClient.post).toHaveBeenCalledWith("/contacts", createDto);
      expect(result).toBeTruthy();
    });
  });

  describe("update", () => {
    it("Given: valid update data When: update is called Then: should PUT and return mapped contact", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({
        data: {
          success: true,
          message: "Updated",
          data: { ...mockContactDto, name: "Jane Doe" },
          timestamp: new Date().toISOString(),
        },
      });

      const result = await adapter.update("contact-001", { name: "Jane Doe" });

      expect(apiClient.put).toHaveBeenCalledWith("/contacts/contact-001", {
        name: "Jane Doe",
      });
      expect(result).toBeTruthy();
    });
  });

  describe("delete", () => {
    it("Given: a valid ID When: delete is called Then: should DELETE the contact", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: undefined });

      await adapter.delete("contact-001");

      expect(apiClient.delete).toHaveBeenCalledWith("/contacts/contact-001");
    });
  });
});
