import { describe, it, expect } from "vitest";
import { Role } from "@/modules/roles/domain/entities/role.entity";

describe("Role", () => {
  const makePermission = (
    overrides: Partial<{
      id: string;
      name: string;
      module: string;
      action: string;
    }> = {},
  ) => ({
    id: overrides.id ?? "perm-1",
    name: overrides.name ?? "USERS:READ",
    description: null,
    module: overrides.module ?? "USERS",
    action: overrides.action ?? "READ",
  });

  const makeRole = (
    overrides: Partial<{
      isSystem: boolean;
      isActive: boolean;
      permissions: ReturnType<typeof makePermission>[];
    }> = {},
  ) =>
    new Role({
      id: "role-1",
      name: "Custom Manager",
      description: null,
      isActive: overrides.isActive ?? true,
      isSystem: overrides.isSystem ?? false,
      permissions: overrides.permissions ?? [makePermission()],
      createdAt: new Date("2026-01-20T00:00:00Z"),
      updatedAt: new Date("2026-02-20T00:00:00Z"),
    });

  it("Given: valid role props When: creating a Role Then: returns instance with correct values", () => {
    // Arrange & Act
    const role = makeRole();

    // Assert
    expect(role.id).toBe("role-1");
    expect(role.name).toBe("Custom Manager");
    expect(role.description).toBeNull();
    expect(role.isActive).toBe(true);
    expect(role.isSystem).toBe(false);
    expect(role.permissions).toHaveLength(1);
    expect(role.createdAt).toEqual(new Date("2026-01-20T00:00:00Z"));
    expect(role.updatedAt).toEqual(new Date("2026-02-20T00:00:00Z"));
  });

  it("Given: role with 3 permissions When: accessing permissionCount Then: returns 3", () => {
    // Arrange
    const permissions = [
      makePermission({
        id: "p-1",
        name: "USERS:READ",
        module: "USERS",
        action: "READ",
      }),
      makePermission({
        id: "p-2",
        name: "USERS:CREATE",
        module: "USERS",
        action: "CREATE",
      }),
      makePermission({
        id: "p-3",
        name: "SALES:READ",
        module: "SALES",
        action: "READ",
      }),
    ];

    // Act
    const role = makeRole({ permissions });

    // Assert
    expect(role.permissionCount).toBe(3);
  });

  it("Given: role with no permissions When: accessing permissionCount Then: returns 0", () => {
    // Arrange & Act
    const role = makeRole({ permissions: [] });

    // Assert
    expect(role.permissionCount).toBe(0);
  });

  it("Given: custom role (isSystem false) When: checking canEdit Then: returns true", () => {
    // Arrange & Act
    const role = makeRole({ isSystem: false });

    // Assert
    expect(role.canEdit).toBe(true);
  });

  it("Given: system role (isSystem true) When: checking canEdit Then: returns false", () => {
    // Arrange & Act
    const role = makeRole({ isSystem: true });

    // Assert
    expect(role.canEdit).toBe(false);
  });

  it("Given: custom role (isSystem false) When: checking canDelete Then: returns true", () => {
    // Arrange & Act
    const role = makeRole({ isSystem: false });

    // Assert
    expect(role.canDelete).toBe(true);
  });

  it("Given: system role (isSystem true) When: checking canDelete Then: returns false", () => {
    // Arrange & Act
    const role = makeRole({ isSystem: true });

    // Assert
    expect(role.canDelete).toBe(false);
  });

  it("Given: role with all getter values When: accessing all properties Then: returns correct values", () => {
    // Arrange
    const permissions = [makePermission()];

    // Act
    const role = new Role({
      id: "role-99",
      name: "Admin",
      description: "Full access role",
      isActive: false,
      isSystem: true,
      permissions,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-03-01T00:00:00Z"),
    });

    // Assert
    expect(role.id).toBe("role-99");
    expect(role.name).toBe("Admin");
    expect(role.description).toBe("Full access role");
    expect(role.isActive).toBe(false);
    expect(role.isSystem).toBe(true);
    expect(role.permissions).toEqual(permissions);
    expect(role.permissionCount).toBe(1);
    expect(role.canEdit).toBe(false);
    expect(role.canDelete).toBe(false);
  });
});
