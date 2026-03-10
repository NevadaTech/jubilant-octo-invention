import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

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

describe("RequirePermission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Given: user has required permission When: rendering Then: should display children", () => {
    // Arrange
    mockHasPermission.mockReturnValue(true);

    // Act
    render(
      <RequirePermission permission={PERMISSIONS.USERS_READ}>
        <span>User List</span>
      </RequirePermission>,
    );

    // Assert
    expect(screen.getByText("User List")).toBeDefined();
  });

  it("Given: user lacks required permission When: rendering Then: should display AccessDenied page", () => {
    // Arrange
    mockHasPermission.mockReturnValue(false);

    // Act
    render(
      <RequirePermission permission={PERMISSIONS.USERS_READ}>
        <span>User List</span>
      </RequirePermission>,
    );

    // Assert
    expect(screen.queryByText("User List")).toBeNull();
    expect(screen.getByText("accessDenied")).toBeDefined();
    expect(screen.getByText("backToDashboard")).toBeDefined();
  });

  it('Given: multiple permissions with mode "all" When: user has all Then: should display children', () => {
    // Arrange
    mockHasAllPermissions.mockReturnValue(true);

    // Act
    render(
      <RequirePermission
        permission={[PERMISSIONS.USERS_READ, PERMISSIONS.USERS_UPDATE]}
        mode="all"
      >
        <span>Edit User Page</span>
      </RequirePermission>,
    );

    // Assert
    expect(screen.getByText("Edit User Page")).toBeDefined();
  });

  it('Given: multiple permissions with default mode "any" When: user has at least one Then: should display children', () => {
    mockHasAnyPermission.mockReturnValue(true);

    render(
      <RequirePermission
        permission={[PERMISSIONS.USERS_READ, PERMISSIONS.USERS_UPDATE]}
      >
        <span>Any Permission Page</span>
      </RequirePermission>,
    );

    expect(screen.getByText("Any Permission Page")).toBeDefined();
    expect(mockHasAnyPermission).toHaveBeenCalled();
  });

  it('Given: multiple permissions with default mode "any" When: user lacks all Then: should display AccessDenied', () => {
    mockHasAnyPermission.mockReturnValue(false);

    render(
      <RequirePermission
        permission={[PERMISSIONS.USERS_READ, PERMISSIONS.USERS_UPDATE]}
      >
        <span>Any Permission Page</span>
      </RequirePermission>,
    );

    expect(screen.queryByText("Any Permission Page")).toBeNull();
    expect(screen.getByText("accessDenied")).toBeDefined();
  });

  it('Given: multiple permissions with mode "all" When: user lacks one Then: should display AccessDenied', () => {
    // Arrange
    mockHasAllPermissions.mockReturnValue(false);

    // Act
    render(
      <RequirePermission
        permission={[PERMISSIONS.USERS_READ, PERMISSIONS.USERS_DELETE]}
        mode="all"
      >
        <span>Delete User Page</span>
      </RequirePermission>,
    );

    // Assert
    expect(screen.queryByText("Delete User Page")).toBeNull();
    expect(screen.getByText("accessDenied")).toBeDefined();
  });
});
