import { describe, it, expect } from "vitest";
import { RoleMapper } from "@/modules/roles/application/mappers/role.mapper";
import type { RoleResponseDto } from "@/modules/roles/application/dto/role.dto";

describe("RoleMapper", () => {
  const mockDto: RoleResponseDto = {
    id: "role-1",
    name: "Admin",
    description: "Administrator role",
    isActive: true,
    isSystem: true,
    permissions: [
      {
        id: "p1",
        name: "USERS:CREATE",
        description: null,
        module: "USERS",
        action: "CREATE",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  };

  describe("toDomain", () => {
    it("Given a valid RoleResponseDto, When toDomain is called, Then it should map all fields to a Role entity", () => {
      // Arrange
      const dto = { ...mockDto };

      // Act
      const entity = RoleMapper.toDomain(dto);

      // Assert
      expect(entity.id).toBe("role-1");
      expect(entity.name).toBe("Admin");
      expect(entity.description).toBe("Administrator role");
      expect(entity.isActive).toBe(true);
      expect(entity.isSystem).toBe(true);
    });

    it("Given a DTO with permissions, When toDomain is called, Then permissions should be mapped to the entity", () => {
      // Arrange
      const dto = { ...mockDto };

      // Act
      const entity = RoleMapper.toDomain(dto);

      // Assert
      expect(entity.permissions).toHaveLength(1);
      expect(entity.permissions[0].id).toBe("p1");
      expect(entity.permissions[0].name).toBe("USERS:CREATE");
      expect(entity.permissions[0].module).toBe("USERS");
      expect(entity.permissions[0].action).toBe("CREATE");
      expect(entity.permissions[0].description).toBeNull();
    });

    it("Given a DTO with null or undefined permissions, When toDomain is called, Then permissions should default to an empty array", () => {
      // Arrange
      const dtoWithoutPermissions: RoleResponseDto = {
        ...mockDto,
        permissions: null as unknown as RoleResponseDto["permissions"],
      };

      // Act
      const entity = RoleMapper.toDomain(dtoWithoutPermissions);

      // Assert
      expect(entity.permissions).toEqual([]);
    });

    it("Given a DTO with ISO date strings, When toDomain is called, Then dates should be converted to Date objects", () => {
      // Arrange
      const dto = { ...mockDto };

      // Act
      const entity = RoleMapper.toDomain(dto);

      // Assert
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);
      expect(entity.createdAt.toISOString()).toBe("2025-01-01T00:00:00.000Z");
      expect(entity.updatedAt.toISOString()).toBe("2025-01-01T00:00:00.000Z");
    });

    it("Given a DTO with null description, When toDomain is called, Then description should be null", () => {
      // Arrange
      const dto: RoleResponseDto = { ...mockDto, description: null };

      // Act
      const entity = RoleMapper.toDomain(dto);

      // Assert
      expect(entity.description).toBeNull();
    });

    it("Given a DTO with multiple permissions, When toDomain is called, Then all permissions should be mapped", () => {
      // Arrange
      const dto: RoleResponseDto = {
        ...mockDto,
        permissions: [
          {
            id: "p1",
            name: "USERS:CREATE",
            description: null,
            module: "USERS",
            action: "CREATE",
          },
          {
            id: "p2",
            name: "USERS:READ",
            description: "Read users",
            module: "USERS",
            action: "READ",
          },
          {
            id: "p3",
            name: "SALES:CREATE",
            description: null,
            module: "SALES",
            action: "CREATE",
          },
        ],
      };

      // Act
      const entity = RoleMapper.toDomain(dto);

      // Assert
      expect(entity.permissions).toHaveLength(3);
      expect(entity.permissions[1].name).toBe("USERS:READ");
      expect(entity.permissions[1].description).toBe("Read users");
      expect(entity.permissions[2].module).toBe("SALES");
    });
  });

  describe("permissionToDomain", () => {
    it("Given a permission DTO, When permissionToDomain is called, Then it should return PermissionProps", () => {
      // Arrange
      const permissionDto = {
        id: "p1",
        name: "USERS:CREATE",
        description: null,
        module: "USERS",
        action: "CREATE",
      };

      // Act
      const result = RoleMapper.permissionToDomain(permissionDto);

      // Assert
      expect(result.id).toBe("p1");
      expect(result.name).toBe("USERS:CREATE");
      expect(result.description).toBeNull();
      expect(result.module).toBe("USERS");
      expect(result.action).toBe("CREATE");
    });

    it("Given a permission DTO with a description, When permissionToDomain is called, Then description should be preserved", () => {
      // Arrange
      const permissionDto = {
        id: "p2",
        name: "SALES:READ",
        description: "Allows reading sales data",
        module: "SALES",
        action: "READ",
      };

      // Act
      const result = RoleMapper.permissionToDomain(permissionDto);

      // Assert
      expect(result.description).toBe("Allows reading sales data");
    });
  });
});
