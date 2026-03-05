import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoleList } from "@/modules/roles/presentation/components/role-list";
import { Role } from "@/modules/roles/domain/entities/role.entity";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key;
    t.has = () => false;
    return t;
  },
}));

vi.mock("@/shared/presentation/components/permission-gate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/modules/authentication/presentation/hooks/use-permissions", () => ({
  usePermissions: () => ({ hasPermission: () => true }),
}));

vi.mock("@/shared/domain/permissions", () => ({
  PERMISSIONS: {
    ROLES_CREATE: "ROLES:CREATE",
    ROLES_UPDATE: "ROLES:UPDATE",
    ROLES_DELETE: "ROLES:DELETE",
  },
}));

let mockRolesQueryState: {
  data: Role[] | undefined;
  isLoading: boolean;
  isError: boolean;
} = { data: undefined, isLoading: false, isError: false };

vi.mock("@/modules/roles/presentation/hooks/use-roles", () => ({
  useRoles: () => mockRolesQueryState,
  useDeleteRole: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useUpdateRole: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock("@/modules/roles/presentation/components/role-type-badge", () => ({
  RoleTypeBadge: ({ isSystem }: { isSystem: boolean }) => (
    <span data-testid="type-badge">{isSystem ? "SYSTEM" : "CUSTOM"}</span>
  ),
}));

vi.mock("@/modules/roles/presentation/components/role-form", () => ({
  RoleForm: () => <div data-testid="role-form" />,
}));

vi.mock(
  "@/modules/roles/presentation/components/role-permissions-dialog",
  () => ({
    RolePermissionsDialog: () => <div data-testid="role-permissions-dialog" />,
  }),
);

// --- Helpers ---

function makeRole(
  overrides: Partial<{
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    isSystem: boolean;
  }> = {},
): Role {
  return new Role({
    id: overrides.id ?? "role-1",
    name: overrides.name ?? "ADMIN",
    description: overrides.description ?? "Administrator role",
    isActive: overrides.isActive ?? true,
    isSystem: overrides.isSystem ?? false,
    permissions: [],
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-01T00:00:00Z"),
  });
}

// --- Tests ---

describe("RoleList", () => {
  beforeEach(() => {
    mockRolesQueryState = { data: undefined, isLoading: false, isError: false };
  });

  it("Given: data loaded When: rendering Then: should display the list title", () => {
    const role = makeRole();
    mockRolesQueryState = { data: [role], isLoading: false, isError: false };

    render(<RoleList />);

    expect(screen.getByText("list.title")).toBeDefined();
  });

  it("Given: roles exist When: rendering Then: should render name and description for each row", () => {
    const r1 = makeRole({
      id: "r1",
      name: "ADMIN",
      description: "Administrator role",
    });
    const r2 = makeRole({
      id: "r2",
      name: "VIEWER",
      description: "Read-only access",
    });

    mockRolesQueryState = { data: [r1, r2], isLoading: false, isError: false };

    render(<RoleList />);

    expect(screen.getByText("ADMIN")).toBeDefined();
    expect(screen.getByText("Administrator role")).toBeDefined();
    expect(screen.getByText("VIEWER")).toBeDefined();
    expect(screen.getByText("Read-only access")).toBeDefined();
  });

  it("Given: roles exist When: rendering Then: should show active/inactive status badges", () => {
    const activeRole = makeRole({
      id: "r1",
      name: "ACTIVE_ROLE",
      isActive: true,
    });
    const inactiveRole = makeRole({
      id: "r2",
      name: "INACTIVE_ROLE",
      isActive: false,
    });

    mockRolesQueryState = {
      data: [activeRole, inactiveRole],
      isLoading: false,
      isError: false,
    };

    render(<RoleList />);

    expect(screen.getByText("status.active")).toBeDefined();
    expect(screen.getByText("status.inactive")).toBeDefined();
  });

  it("Given: no roles When: rendering Then: should show empty state", () => {
    mockRolesQueryState = { data: [], isLoading: false, isError: false };

    render(<RoleList />);

    expect(screen.getByText("empty.title")).toBeDefined();
    expect(screen.getByText("empty.description")).toBeDefined();
  });

  it("Given: loading state When: rendering Then: should show skeleton placeholders", () => {
    mockRolesQueryState = { data: undefined, isLoading: true, isError: false };

    const { container } = render(<RoleList />);

    const skeletons = container.querySelectorAll(".h-16");
    expect(skeletons.length).toBe(5);
  });

  it("Given: error state When: rendering Then: should show error message", () => {
    mockRolesQueryState = { data: undefined, isLoading: false, isError: true };

    render(<RoleList />);

    expect(screen.getByText("error.loading")).toBeDefined();
  });
});
