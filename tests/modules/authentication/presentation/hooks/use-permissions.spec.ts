import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { User } from "@/modules/authentication/domain/entities/user";

let mockUser: User | null = null;

vi.mock("@/modules/authentication/presentation/store/auth.store", () => ({
  useAuthStore: (selector: (state: { user: User | null }) => unknown) =>
    selector({ user: mockUser }),
}));

import { usePermissions } from "@/modules/authentication/presentation/hooks/use-permissions";

function createUser(permissions: string[], roles: string[] = ["ADMIN"]): User {
  return User.create({
    id: "user-1",
    email: "test@test.com",
    username: "testuser",
    firstName: "Test",
    lastName: "User",
    roles,
    permissions,
  });
}

describe("usePermissions", () => {
  beforeEach(() => {
    mockUser = null;
  });

  it("Given: no authenticated user When: calling the hook Then: should return empty permissions and isAuthenticated false", () => {
    mockUser = null;
    const { result } = renderHook(() => usePermissions());
    expect(result.current.permissions).toEqual([]);
    expect(result.current.roles).toEqual([]);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("Given: an authenticated user with permissions When: calling hasPermission Then: should return true for granted permissions", () => {
    mockUser = createUser(["PRODUCTS:READ", "SALES:CREATE"]);
    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasPermission("PRODUCTS:READ" as any)).toBe(true);
    expect(result.current.hasPermission("USERS:DELETE" as any)).toBe(false);
  });

  it("Given: an authenticated user When: calling hasAnyPermission Then: should return true if at least one permission matches", () => {
    mockUser = createUser(["PRODUCTS:READ"]);
    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasAnyPermission(["PRODUCTS:READ", "SALES:CREATE"] as any[])).toBe(true);
    expect(result.current.hasAnyPermission(["USERS:DELETE", "ROLES:CREATE"] as any[])).toBe(false);
  });

  it("Given: an authenticated user When: calling hasAllPermissions Then: should return true only if all permissions match", () => {
    mockUser = createUser(["PRODUCTS:READ", "SALES:CREATE", "USERS:READ"]);
    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasAllPermissions(["PRODUCTS:READ", "SALES:CREATE"] as any[])).toBe(true);
    expect(result.current.hasAllPermissions(["PRODUCTS:READ", "ROLES:DELETE"] as any[])).toBe(false);
  });

  it("Given: an authenticated user with roles When: calling hasRole Then: should return true for assigned roles", () => {
    mockUser = createUser(["PRODUCTS:READ"], ["ADMIN", "MANAGER"]);
    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasRole("ADMIN")).toBe(true);
    expect(result.current.hasRole("SUPER_ADMIN")).toBe(false);
  });

  it("Given: no authenticated user When: calling permission check methods Then: should return false for all checks", () => {
    mockUser = null;
    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasPermission("PRODUCTS:READ" as any)).toBe(false);
    expect(result.current.hasAnyPermission(["PRODUCTS:READ"] as any[])).toBe(false);
    expect(result.current.hasAllPermissions(["PRODUCTS:READ"] as any[])).toBe(false);
    expect(result.current.hasRole("ADMIN")).toBe(false);
  });
});
