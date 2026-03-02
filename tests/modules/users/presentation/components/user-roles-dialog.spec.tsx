import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserRolesDialog } from "@/modules/users/presentation/components/user-roles-dialog";
import { User } from "@/modules/users/domain/entities/user.entity";
import { Role } from "@/modules/roles/domain/entities/role.entity";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock("@/ui/components/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    title,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    title?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      title={title}
    >
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
}));

vi.mock("@/ui/components/select", () => ({
  Select: ({
    children,
    onValueChange,
  }: {
    children: React.ReactNode;
    onValueChange?: (v: string) => void;
  }) => (
    <div data-testid="select" data-onvaluechange={!!onValueChange}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({
    children,
    disabled,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
  }) => (
    <div data-testid="select-trigger" data-disabled={disabled}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span data-testid="select-value">{placeholder}</span>
  ),
}));

const mockAssignMutateAsync = vi.fn().mockResolvedValue({});
const mockRemoveMutateAsync = vi.fn().mockResolvedValue({});

let mockRolesData: {
  data: Role[] | undefined;
  isLoading: boolean;
} = { data: undefined, isLoading: false };

vi.mock("@/modules/roles/presentation/hooks/use-roles", () => ({
  useRoles: () => mockRolesData,
}));

vi.mock("@/modules/users/presentation/hooks/use-users", () => ({
  useAssignRole: () => ({
    isPending: false,
    mutateAsync: mockAssignMutateAsync,
  }),
  useRemoveRole: () => ({
    isPending: false,
    mutateAsync: mockRemoveMutateAsync,
  }),
}));

// --- Helpers ---

function makeUser(
  overrides: Partial<{
    id: string;
    firstName: string;
    lastName: string;
    roles: string[];
  }> = {},
): User {
  return User.create({
    id: overrides.id ?? "user-1",
    email: "test@example.com",
    username: "testuser",
    firstName: overrides.firstName ?? "John",
    lastName: overrides.lastName ?? "Doe",
    status: "ACTIVE",
    roles: overrides.roles ?? ["ADMIN"],
    lastLoginAt: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-01T00:00:00Z"),
  });
}

function makeRoleEntity(
  overrides: Partial<{
    id: string;
    name: string;
    isActive: boolean;
    isSystem: boolean;
  }> = {},
): Role {
  return new Role({
    id: overrides.id ?? "role-1",
    name: overrides.name ?? "ADMIN",
    description: null,
    isActive: overrides.isActive ?? true,
    isSystem: overrides.isSystem ?? false,
    permissions: [],
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-01T00:00:00Z"),
  });
}

// --- Tests ---

describe("UserRolesDialog", () => {
  const onOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockRolesData = { data: undefined, isLoading: false };
  });

  it("Given: open is false When: rendering Then: should not render the dialog", () => {
    const user = makeUser();

    const { container } = render(
      <UserRolesDialog user={user} open={false} onOpenChange={onOpenChange} />,
    );

    expect(container.querySelector('[data-testid="dialog"]')).toBeNull();
  });

  it("Given: open is true with a user When: rendering Then: should display the dialog title with user full name", () => {
    const user = makeUser({ firstName: "Jane", lastName: "Smith" });
    mockRolesData = { data: [], isLoading: false };

    render(
      <UserRolesDialog user={user} open={true} onOpenChange={onOpenChange} />,
    );

    const title = screen.getByTestId("dialog-title");
    expect(title.textContent).toContain("roles.title");
    expect(title.textContent).toContain("Jane Smith");
  });

  it("Given: roles are loading When: rendering Then: should display skeleton placeholders", () => {
    const user = makeUser();
    mockRolesData = { data: undefined, isLoading: true };

    render(
      <UserRolesDialog user={user} open={true} onOpenChange={onOpenChange} />,
    );

    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThanOrEqual(2);
  });

  it("Given: user has assigned roles When: rendering Then: should display assigned role names", () => {
    const user = makeUser({ roles: ["ADMIN", "VIEWER"] });
    const allRoles = [
      makeRoleEntity({ id: "r1", name: "ADMIN", isActive: true }),
      makeRoleEntity({ id: "r2", name: "VIEWER", isActive: true }),
      makeRoleEntity({ id: "r3", name: "EDITOR", isActive: true }),
    ];
    mockRolesData = { data: allRoles, isLoading: false };

    render(
      <UserRolesDialog user={user} open={true} onOpenChange={onOpenChange} />,
    );

    expect(screen.getByText("ADMIN")).toBeDefined();
    expect(screen.getByText("VIEWER")).toBeDefined();
  });

  it("Given: user has only one role When: rendering Then: should show cannot remove last role warning", () => {
    const user = makeUser({ roles: ["ADMIN"] });
    const allRoles = [
      makeRoleEntity({ id: "r1", name: "ADMIN", isActive: true }),
      makeRoleEntity({ id: "r2", name: "VIEWER", isActive: true }),
    ];
    mockRolesData = { data: allRoles, isLoading: false };

    render(
      <UserRolesDialog user={user} open={true} onOpenChange={onOpenChange} />,
    );

    expect(screen.getByText("roles.cannotRemoveLast")).toBeDefined();
  });

  it("Given: available roles exist When: rendering Then: should show select dropdown with available roles", () => {
    const user = makeUser({ roles: ["ADMIN"] });
    const allRoles = [
      makeRoleEntity({ id: "r1", name: "ADMIN", isActive: true }),
      makeRoleEntity({ id: "r2", name: "EDITOR", isActive: true }),
    ];
    mockRolesData = { data: allRoles, isLoading: false };

    render(
      <UserRolesDialog user={user} open={true} onOpenChange={onOpenChange} />,
    );

    expect(screen.getByTestId("select")).toBeDefined();
    const selectItems = screen.getAllByTestId("select-item");
    expect(selectItems.length).toBe(1);
    expect(selectItems[0].textContent).toBe("EDITOR");
  });

  it("Given: no available roles remain When: rendering Then: should show no roles available message", () => {
    const user = makeUser({ roles: ["ADMIN", "EDITOR"] });
    const allRoles = [
      makeRoleEntity({ id: "r1", name: "ADMIN", isActive: true }),
      makeRoleEntity({ id: "r2", name: "EDITOR", isActive: true }),
    ];
    mockRolesData = { data: allRoles, isLoading: false };

    render(
      <UserRolesDialog user={user} open={true} onOpenChange={onOpenChange} />,
    );

    expect(screen.getByText("roles.noRolesAvailable")).toBeDefined();
  });
});
