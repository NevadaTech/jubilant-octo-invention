import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RolePermissionsDialog } from "@/modules/roles/presentation/components/role-permissions-dialog";
import { Role } from "@/modules/roles/domain/entities/role.entity";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key;
    t.has = () => true;
    return t;
  },
}));

vi.mock("@/ui/components/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock("@/ui/components/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

vi.mock("@/ui/components/dialog", () => ({
  Dialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open: boolean;
  }) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <h2 data-testid="dialog-title" className={className}>
      {children}
    </h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="dialog-description">{children}</p>
  ),
  DialogFooter: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="dialog-footer" className={className}>
      {children}
    </div>
  ),
}));

const mockMutateAsync = vi.fn().mockResolvedValue({});

let mockAllPermissions: {
  data: Array<{
    id: string;
    name: string;
    description: string | null;
    module: string;
    action: string;
  }> | undefined;
  isLoading: boolean;
} = { data: undefined, isLoading: false };

let mockRolePermissions: {
  data: Array<{
    id: string;
    name: string;
    description: string | null;
    module: string;
    action: string;
  }> | undefined;
  isLoading: boolean;
} = { data: undefined, isLoading: false };

vi.mock("@/modules/roles/presentation/hooks/use-roles", () => ({
  usePermissions: () => mockAllPermissions,
  useRolePermissions: () => mockRolePermissions,
  useAssignPermissions: () => ({
    isPending: false,
    mutateAsync: mockMutateAsync,
  }),
}));

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

function makePerm(
  module: string,
  action: string,
  id?: string,
): {
  id: string;
  name: string;
  description: string | null;
  module: string;
  action: string;
} {
  return {
    id: id ?? `${module}:${action}`,
    name: `${module}:${action}`,
    description: null,
    module,
    action,
  };
}

// --- Tests ---

describe("RolePermissionsDialog", () => {
  const onOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAllPermissions = { data: undefined, isLoading: false };
    mockRolePermissions = { data: undefined, isLoading: false };
  });

  it("Given: open is false When: rendering Then: should not render the dialog", () => {
    const role = makeRole();

    const { container } = render(
      <RolePermissionsDialog
        role={role}
        open={false}
        onOpenChange={onOpenChange}
      />,
    );

    expect(container.querySelector('[data-testid="dialog"]')).toBeNull();
  });

  it("Given: open is true with a role When: rendering Then: should display the dialog title with role name", () => {
    const role = makeRole({ name: "MANAGER" });
    mockAllPermissions = { data: [], isLoading: false };
    mockRolePermissions = { data: [], isLoading: false };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    expect(screen.getByTestId("dialog-title").textContent).toContain(
      "MANAGER",
    );
    expect(screen.getByTestId("dialog-title").textContent).toContain(
      "permissions.title",
    );
  });

  it("Given: permissions are loading When: rendering Then: should display skeleton placeholders", () => {
    const role = makeRole();
    mockAllPermissions = { data: undefined, isLoading: true };
    mockRolePermissions = { data: undefined, isLoading: false };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBe(4);
  });

  it("Given: permissions loaded grouped by module When: rendering Then: should display module groups with permission actions", () => {
    const role = makeRole();
    const perms = [
      makePerm("INVENTORY", "READ", "p1"),
      makePerm("INVENTORY", "CREATE", "p2"),
      makePerm("SALES", "READ", "p3"),
    ];
    mockAllPermissions = { data: perms, isLoading: false };
    mockRolePermissions = { data: [], isLoading: false };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    // READ appears in both INVENTORY and SALES modules
    const readElements = screen.getAllByText("READ");
    expect(readElements.length).toBe(2);
    expect(screen.getByText("CREATE")).toBeDefined();
  });

  it("Given: readOnly is true When: rendering Then: should show close button instead of cancel and save", () => {
    const role = makeRole();
    mockAllPermissions = { data: [], isLoading: false };
    mockRolePermissions = { data: [], isLoading: false };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
        readOnly={true}
      />,
    );

    expect(screen.getByText("close")).toBeDefined();
    expect(screen.queryByText("save")).toBeNull();
  });

  it("Given: readOnly is false and no permissions selected When: rendering Then: should show save button as disabled", () => {
    const role = makeRole();
    mockAllPermissions = {
      data: [makePerm("INVENTORY", "READ", "p1")],
      isLoading: false,
    };
    mockRolePermissions = { data: [], isLoading: false };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
        readOnly={false}
      />,
    );

    const saveButton = screen.getByText("save");
    expect(saveButton.closest("button")?.disabled).toBe(true);
  });

  it("Given: no permissions available When: rendering Then: should display empty state message", () => {
    const role = makeRole();
    mockAllPermissions = { data: [], isLoading: false };
    mockRolePermissions = { data: [], isLoading: false };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    expect(screen.getByText("permissions.noPermissions")).toBeDefined();
  });
});
