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

import { apiClient } from "@/shared/infrastructure/http";
import { RoleApiAdapter } from "@/modules/roles/infrastructure/adapters/role-api.adapter";
import { Role } from "@/modules/roles/domain/entities/role.entity";
import type {
  RoleResponseDto,
  PermissionResponseDto,
} from "@/modules/roles/application/dto/role.dto";

const mockedGet = vi.mocked(apiClient.get);
const mockedPost = vi.mocked(apiClient.post);
const mockedPatch = vi.mocked(apiClient.patch);
const mockedDelete = vi.mocked(apiClient.delete);

function buildRoleDto(overrides: Partial<RoleResponseDto> = {}): RoleResponseDto {
  return {
    id: "role-1",
    name: "Admin",
    description: "Administrator role",
    isActive: true,
    isSystem: false,
    permissions: [],
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-01-16T10:00:00.000Z",
    ...overrides,
  };
}

function buildPermissionDto(
  overrides: Partial<PermissionResponseDto> = {},
): PermissionResponseDto {
  return {
    id: "perm-1",
    name: "USERS:CREATE",
    description: "Create users",
    module: "USERS",
    action: "CREATE",
    ...overrides,
  };
}

function wrapApiResponse<T>(data: T) {
  return {
    data: {
      success: true,
      message: "OK",
      data,
      timestamp: "2026-01-15T10:00:00.000Z",
    },
    status: 200,
    headers: {},
  };
}

describe("RoleApiAdapter", () => {
  let adapter: RoleApiAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new RoleApiAdapter();
  });

  describe("findAll", () => {
    it("Given roles exist in the API, When findAll is called, Then it returns mapped Role domain entities", async () => {
      const dto1 = buildRoleDto({ id: "role-1", name: "Admin" });
      const dto2 = buildRoleDto({ id: "role-2", name: "Viewer", isSystem: true });
      mockedGet.mockResolvedValue(wrapApiResponse([dto1, dto2]));

      const result = await adapter.findAll();

      expect(mockedGet).toHaveBeenCalledWith("/roles");
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Role);
      expect(result[0].id).toBe("role-1");
      expect(result[0].name).toBe("Admin");
      expect(result[1].id).toBe("role-2");
      expect(result[1].isSystem).toBe(true);
    });
  });

  describe("findById", () => {
    it("Given a role exists, When findById is called with its id, Then it returns the mapped Role domain entity", async () => {
      const dto = buildRoleDto({
        id: "role-42",
        name: "Editor",
        description: "Can edit things",
      });
      mockedGet.mockResolvedValue(wrapApiResponse(dto));

      const result = await adapter.findById("role-42");

      expect(mockedGet).toHaveBeenCalledWith("/roles/role-42");
      expect(result).toBeInstanceOf(Role);
      expect(result.id).toBe("role-42");
      expect(result.name).toBe("Editor");
      expect(result.description).toBe("Can edit things");
    });
  });

  describe("create", () => {
    it("Given valid create data, When create is called, Then it posts to /roles and returns the created Role", async () => {
      const createDto = { name: "New Role", description: "A new custom role" };
      const responseDto = buildRoleDto({
        id: "role-new",
        name: "New Role",
        description: "A new custom role",
      });
      mockedPost.mockResolvedValue(wrapApiResponse(responseDto));

      const result = await adapter.create(createDto);

      expect(mockedPost).toHaveBeenCalledWith("/roles", createDto);
      expect(result).toBeInstanceOf(Role);
      expect(result.id).toBe("role-new");
      expect(result.name).toBe("New Role");
    });
  });

  describe("update", () => {
    it("Given valid update data, When update is called, Then it patches /roles/:id and returns the updated Role", async () => {
      const updateDto = { description: "Updated description", isActive: false };
      const responseDto = buildRoleDto({
        id: "role-1",
        description: "Updated description",
        isActive: false,
      });
      mockedPatch.mockResolvedValue(wrapApiResponse(responseDto));

      const result = await adapter.update("role-1", updateDto);

      expect(mockedPatch).toHaveBeenCalledWith("/roles/role-1", updateDto);
      expect(result).toBeInstanceOf(Role);
      expect(result.description).toBe("Updated description");
      expect(result.isActive).toBe(false);
    });
  });

  describe("delete", () => {
    it("Given a role id, When delete is called, Then it sends a DELETE request to /roles/:id", async () => {
      mockedDelete.mockResolvedValue({ data: undefined, status: 204, headers: {} });

      await adapter.delete("role-99");

      expect(mockedDelete).toHaveBeenCalledWith("/roles/role-99");
    });
  });

  describe("assignPermissions", () => {
    it("Given a role id and permission ids, When assignPermissions is called, Then it posts to /roles/:id/permissions", async () => {
      const dto = { permissionIds: ["perm-1", "perm-2", "perm-3"] };
      mockedPost.mockResolvedValue({ data: undefined, status: 200, headers: {} });

      await adapter.assignPermissions("role-5", dto);

      expect(mockedPost).toHaveBeenCalledWith("/roles/role-5/permissions", dto);
    });
  });

  describe("getPermissions", () => {
    it("Given permissions exist, When getPermissions is called, Then it returns all mapped PermissionProps", async () => {
      const perm1 = buildPermissionDto({ id: "perm-1", name: "USERS:CREATE" });
      const perm2 = buildPermissionDto({
        id: "perm-2",
        name: "SALES:READ",
        module: "SALES",
        action: "READ",
      });
      mockedGet.mockResolvedValue(wrapApiResponse([perm1, perm2]));

      const result = await adapter.getPermissions();

      expect(mockedGet).toHaveBeenCalledWith("/roles/permissions");
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "perm-1",
        name: "USERS:CREATE",
        description: "Create users",
        module: "USERS",
        action: "CREATE",
      });
      expect(result[1].module).toBe("SALES");
    });
  });

  describe("getRolePermissions", () => {
    it("Given a role has permissions, When getRolePermissions is called, Then it returns the role-specific permissions", async () => {
      const perm = buildPermissionDto({
        id: "perm-5",
        name: "INVENTORY:MANAGE",
        module: "INVENTORY",
        action: "MANAGE",
        description: null,
      });
      mockedGet.mockResolvedValue(wrapApiResponse([perm]));

      const result = await adapter.getRolePermissions("role-10");

      expect(mockedGet).toHaveBeenCalledWith("/roles/role-10/permissions");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("perm-5");
      expect(result[0].description).toBeNull();
    });
  });

  describe("findAll with permissions on roles", () => {
    it("Given a role has inline permissions, When findAll maps the response, Then permissions are included in the domain entity", async () => {
      const dto = buildRoleDto({
        id: "role-7",
        permissions: [
          buildPermissionDto({ id: "p1" }),
          buildPermissionDto({ id: "p2" }),
        ],
      });
      mockedGet.mockResolvedValue(wrapApiResponse([dto]));

      const result = await adapter.findAll();

      expect(result[0].permissions).toHaveLength(2);
      expect(result[0].permissionCount).toBe(2);
    });
  });

  describe("error propagation", () => {
    it("Given the API call fails, When findAll is called, Then the error propagates", async () => {
      mockedGet.mockRejectedValue(new Error("Network error"));

      await expect(adapter.findAll()).rejects.toThrow("Network error");
    });
  });
});
