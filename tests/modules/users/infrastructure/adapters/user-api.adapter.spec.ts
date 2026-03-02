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

vi.mock("@/modules/users/application/mappers/user.mapper", () => ({
  UserMapper: {
    toDomain: vi.fn((dto: unknown) => dto),
  },
}));

import { apiClient } from "@/shared/infrastructure/http";
import { UserApiAdapter } from "@/modules/users/infrastructure/adapters/user-api.adapter";
import type { UserResponseDto } from "@/modules/users/application/dto/user.dto";

describe("UserApiAdapter", () => {
  let adapter: UserApiAdapter;

  const mockUserDto: UserResponseDto = {
    id: "user-001",
    email: "john@example.com",
    username: "johndoe",
    firstName: "John",
    lastName: "Doe",
    status: "ACTIVE",
    roles: ["admin"],
    lastLoginAt: "2025-01-15T10:00:00.000Z",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-15T10:00:00.000Z",
  };

  const mockPagination = {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new UserApiAdapter();
  });

  describe("findAll", () => {
    it("Given: no filters When: findAll is called Then: should GET /users with empty params", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "OK",
          data: [mockUserDto],
          pagination: mockPagination,
          timestamp: "2025-01-15T10:00:00.000Z",
        },
        status: 200,
        headers: {},
      });

      const result = await adapter.findAll();

      expect(apiClient.get).toHaveBeenCalledWith("/users", {
        params: {},
      });
      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual(mockPagination);
    });

    it("Given: status and search filters When: findAll is called Then: should join status array with commas", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "OK",
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
          timestamp: "2025-01-15T10:00:00.000Z",
        },
        status: 200,
        headers: {},
      });

      await adapter.findAll({
        status: ["ACTIVE", "LOCKED"],
        search: "john",
        page: 1,
        limit: 10,
      });

      expect(apiClient.get).toHaveBeenCalledWith("/users", {
        params: {
          status: "ACTIVE,LOCKED",
          search: "john",
          page: 1,
          limit: 10,
        },
      });
    });
  });

  describe("findById", () => {
    it("Given: a valid user ID When: findById is called Then: should return the mapped user", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "OK",
          data: mockUserDto,
          timestamp: "2025-01-15T10:00:00.000Z",
        },
        status: 200,
        headers: {},
      });

      const result = await adapter.findById("user-001");

      expect(apiClient.get).toHaveBeenCalledWith("/users/user-001");
      expect(result).toBeTruthy();
    });

    it("Given: a non-existent user ID When: findById is called Then: should return null on 404", async () => {
      vi.mocked(apiClient.get).mockRejectedValue({
        response: { status: 404 },
      });

      const result = await adapter.findById("non-existent");

      expect(result).toBeNull();
    });

    it("Given: an API error other than 404 When: findById is called Then: should rethrow the error", async () => {
      const serverError = new Error("Server Error");
      vi.mocked(apiClient.get).mockRejectedValue(serverError);

      await expect(adapter.findById("user-001")).rejects.toThrow("Server Error");
    });
  });

  describe("create", () => {
    it("Given: valid create data When: create is called Then: should POST and return mapped user", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          message: "Created",
          data: mockUserDto,
          timestamp: "2025-01-15T10:00:00.000Z",
        },
        status: 201,
        headers: {},
      });

      const createDto = {
        email: "john@example.com",
        username: "johndoe",
        password: "P@ssw0rd123",
        firstName: "John",
        lastName: "Doe",
      };
      const result = await adapter.create(createDto);

      expect(apiClient.post).toHaveBeenCalledWith("/users", createDto);
      expect(result).toBeTruthy();
    });
  });

  describe("update", () => {
    it("Given: valid update data When: update is called Then: should PUT and return mapped user", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({
        data: {
          success: true,
          message: "Updated",
          data: { ...mockUserDto, firstName: "Jane" },
          timestamp: "2025-01-15T10:00:00.000Z",
        },
        status: 200,
        headers: {},
      });

      const updateDto = { firstName: "Jane" };
      const result = await adapter.update("user-001", updateDto);

      expect(apiClient.put).toHaveBeenCalledWith("/users/user-001", updateDto);
      expect(result).toBeTruthy();
    });
  });

  describe("changeStatus", () => {
    it("Given: valid status change data When: changeStatus is called Then: should PATCH /users/:id/status", async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({
        data: {
          success: true,
          message: "Status changed",
          data: { ...mockUserDto, status: "LOCKED" },
          timestamp: "2025-01-15T10:00:00.000Z",
        },
        status: 200,
        headers: {},
      });

      const statusDto = {
        status: "LOCKED" as const,
        reason: "Too many failed attempts",
        lockDurationMinutes: 30,
      };
      const result = await adapter.changeStatus("user-001", statusDto);

      expect(apiClient.patch).toHaveBeenCalledWith("/users/user-001/status", statusDto);
      expect(result).toBeTruthy();
    });
  });

  describe("assignRole", () => {
    it("Given: valid role assignment When: assignRole is called Then: should POST to /users/:id/roles", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: undefined,
        status: 200,
        headers: {},
      });

      const assignDto = { roleId: "role-001" };
      await adapter.assignRole("user-001", assignDto);

      expect(apiClient.post).toHaveBeenCalledWith("/users/user-001/roles", assignDto);
    });
  });

  describe("removeRole", () => {
    it("Given: valid role removal When: removeRole is called Then: should DELETE /users/:id/roles/:roleId", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        data: undefined,
        status: 204,
        headers: {},
      });

      await adapter.removeRole("user-001", "role-001");

      expect(apiClient.delete).toHaveBeenCalledWith("/users/user-001/roles/role-001");
    });
  });
});
