import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PermissionGate } from "@/shared/presentation/components/permission-gate";
import { PERMISSIONS } from "@/shared/domain/permissions";

const mockHasPermission = vi.fn();
const mockHasAnyPermission = vi.fn();
const mockHasAllPermissions = vi.fn();

vi.mock("@/modules/authentication/presentation/hooks/use-permissions", () => ({
  usePermissions: () => ({
    hasPermission: mockHasPermission,
    hasAnyPermission: mockHasAnyPermission,
    hasAllPermissions: mockHasAllPermissions,
  }),
}));

describe("PermissionGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Given: user has required permission When: rendering Then: should display children", () => {
    // Arrange
    mockHasPermission.mockReturnValue(true);

    // Act
    render(
      <PermissionGate permission={PERMISSIONS.USERS_CREATE}>
        <span>Create User Button</span>
      </PermissionGate>,
    );

    // Assert
    expect(screen.getByText("Create User Button")).toBeDefined();
  });

  it("Given: user lacks required permission When: rendering Then: should not display children", () => {
    // Arrange
    mockHasPermission.mockReturnValue(false);

    // Act
    render(
      <PermissionGate permission={PERMISSIONS.USERS_CREATE}>
        <span>Create User Button</span>
      </PermissionGate>,
    );

    // Assert
    expect(screen.queryByText("Create User Button")).toBeNull();
  });

  it("Given: user lacks permission and fallback provided When: rendering Then: should display fallback", () => {
    // Arrange
    mockHasPermission.mockReturnValue(false);

    // Act
    render(
      <PermissionGate
        permission={PERMISSIONS.USERS_CREATE}
        fallback={<span>No access</span>}
      >
        <span>Create User Button</span>
      </PermissionGate>,
    );

    // Assert
    expect(screen.queryByText("Create User Button")).toBeNull();
    expect(screen.getByText("No access")).toBeDefined();
  });

  it('Given: multiple permissions with mode "any" When: user has at least one Then: should display children', () => {
    // Arrange
    mockHasAnyPermission.mockReturnValue(true);

    // Act
    render(
      <PermissionGate
        permission={[PERMISSIONS.SALES_CONFIRM, PERMISSIONS.SALES_CANCEL]}
        mode="any"
      >
        <span>Actions Menu</span>
      </PermissionGate>,
    );

    // Assert
    expect(screen.getByText("Actions Menu")).toBeDefined();
  });

  it('Given: multiple permissions with mode "all" When: user has all Then: should display children', () => {
    // Arrange
    mockHasAllPermissions.mockReturnValue(true);

    // Act
    render(
      <PermissionGate
        permission={[PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_UPDATE]}
        mode="all"
      >
        <span>Admin Panel</span>
      </PermissionGate>,
    );

    // Assert
    expect(screen.getByText("Admin Panel")).toBeDefined();
  });

  it('Given: multiple permissions with mode "all" When: user lacks one Then: should not display children', () => {
    // Arrange
    mockHasAllPermissions.mockReturnValue(false);

    // Act
    render(
      <PermissionGate
        permission={[PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_DELETE]}
        mode="all"
      >
        <span>Admin Panel</span>
      </PermissionGate>,
    );

    // Assert
    expect(screen.queryByText("Admin Panel")).toBeNull();
  });
});
