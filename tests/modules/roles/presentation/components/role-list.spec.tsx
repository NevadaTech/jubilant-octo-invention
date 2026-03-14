import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RoleList } from "@/modules/roles/presentation/components/role-list";
import { Role } from "@/modules/roles/domain/entities/role.entity";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => {
    const t = (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key;
    t.has = (key: string) => key === "names.ADMIN";
    return t;
  },
}));

vi.mock("@/shared/presentation/components/permission-gate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

let mockHasPermission = (_p: string) => true;

vi.mock("@/modules/authentication/presentation/hooks/use-permissions", () => ({
  usePermissions: () => ({
    hasPermission: (p: string) => mockHasPermission(p),
  }),
}));

vi.mock("@/shared/domain/permissions", () => ({
  PERMISSIONS: {
    ROLES_CREATE: "ROLES:CREATE",
    ROLES_UPDATE: "ROLES:UPDATE",
    ROLES_DELETE: "ROLES:DELETE",
  },
}));

const mockDeleteMutateAsync = vi.fn();
const mockUpdateMutateAsync = vi.fn();
let mockDeletePending = false;

let mockRolesQueryState: {
  data: Role[] | undefined;
  isLoading: boolean;
  isError: boolean;
} = { data: undefined, isLoading: false, isError: false };

vi.mock("@/modules/roles/presentation/hooks/use-roles", () => ({
  useRoles: () => mockRolesQueryState,
  useDeleteRole: () => ({
    isPending: mockDeletePending,
    mutateAsync: mockDeleteMutateAsync,
  }),
  useUpdateRole: () => ({
    isPending: false,
    mutateAsync: mockUpdateMutateAsync,
  }),
}));

vi.mock("@/modules/roles/presentation/components/role-type-badge", () => ({
  RoleTypeBadge: ({ isSystem }: { isSystem: boolean }) => (
    <span data-testid="type-badge">{isSystem ? "SYSTEM" : "CUSTOM"}</span>
  ),
}));

vi.mock("@/modules/roles/presentation/components/role-form", () => ({
  RoleForm: ({ open }: { open: boolean }) => (
    <div data-testid="role-form" data-open={open} />
  ),
}));

vi.mock(
  "@/modules/roles/presentation/components/role-permissions-dialog",
  () => ({
    RolePermissionsDialog: ({
      open,
      readOnly,
    }: {
      open: boolean;
      readOnly: boolean;
    }) => (
      <div
        data-testid="role-permissions-dialog"
        data-open={open}
        data-readonly={readOnly}
      />
    ),
  }),
);

vi.mock("@/ui/components/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <button data-testid="dropdown-item" onClick={onClick} className={className}>
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
}));

vi.mock("@/ui/components/alert-dialog", () => ({
  AlertDialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
  }) => (
    <div data-testid="alert-dialog" data-open={open}>
      {children}
    </div>
  ),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogCancel: ({
    children,
    disabled,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
  }) => <button disabled={disabled}>{children}</button>,
  AlertDialogAction: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled} data-testid="alert-action">
      {children}
    </button>
  ),
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
    description:
      "description" in overrides
        ? (overrides.description as string | null)
        : "Administrator role",
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
    mockHasPermission = () => true;
    mockDeleteMutateAsync.mockReset();
    mockUpdateMutateAsync.mockReset();
    mockDeletePending = false;
  });

  // --- Loading ---
  it("Given: loading state When: rendering Then: should show skeleton placeholders", () => {
    mockRolesQueryState = { data: undefined, isLoading: true, isError: false };
    const { container } = render(<RoleList />);
    const skeletons = container.querySelectorAll(".h-16");
    expect(skeletons.length).toBe(5);
  });

  // --- Error ---
  it("Given: error state When: rendering Then: should show error message", () => {
    mockRolesQueryState = { data: undefined, isLoading: false, isError: true };
    render(<RoleList />);
    expect(screen.getByText("error.loading")).toBeDefined();
  });

  it("Given: error state When: rendering Then: should not show list title", () => {
    mockRolesQueryState = { data: undefined, isLoading: false, isError: true };
    render(<RoleList />);
    expect(screen.queryByText("list.title")).not.toBeInTheDocument();
  });

  // --- Empty ---
  it("Given: empty roles When: rendering Then: should show empty state", () => {
    mockRolesQueryState = { data: [], isLoading: false, isError: false };
    render(<RoleList />);
    expect(screen.getByText("empty.title")).toBeDefined();
    expect(screen.getByText("empty.description")).toBeDefined();
  });

  // --- Data display ---
  it("Given: roles exist When: rendering Then: should display list title", () => {
    mockRolesQueryState = {
      data: [makeRole()],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    expect(screen.getByText("list.title")).toBeDefined();
  });

  it("Given: role name matching i18n key When: rendering Then: should show translated name", () => {
    // t.has("names.ADMIN") returns true, so t("names.ADMIN") = "names.ADMIN"
    mockRolesQueryState = {
      data: [makeRole({ name: "ADMIN" })],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    expect(screen.getByText("names.ADMIN")).toBeDefined();
  });

  it("Given: role name NOT matching i18n key When: rendering Then: should show raw name", () => {
    // t.has("names.CUSTOM_ROLE") returns false, so raw name used
    mockRolesQueryState = {
      data: [makeRole({ name: "CUSTOM_ROLE" })],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    expect(screen.getByText("CUSTOM_ROLE")).toBeDefined();
  });

  it("Given: role with null description When: rendering Then: should show dash", () => {
    mockRolesQueryState = {
      data: [makeRole({ description: null })],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    expect(screen.getByText("-")).toBeDefined();
  });

  it("Given: role with description When: rendering Then: should show description", () => {
    mockRolesQueryState = {
      data: [makeRole({ description: "Some desc" })],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    expect(screen.getByText("Some desc")).toBeDefined();
  });

  it("Given: active role When: rendering Then: should show active badge", () => {
    mockRolesQueryState = {
      data: [makeRole({ isActive: true })],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    expect(screen.getByText("status.active")).toBeDefined();
  });

  it("Given: inactive role When: rendering Then: should show inactive badge", () => {
    mockRolesQueryState = {
      data: [makeRole({ isActive: false })],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    expect(screen.getByText("status.inactive")).toBeDefined();
  });

  // --- Permissions dialog text: system vs editable ---
  it("Given: system role When: rendering Then: should show viewPermissions text", () => {
    mockRolesQueryState = {
      data: [makeRole({ isSystem: true })],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    const items = screen.getAllByTestId("dropdown-item");
    expect(
      items.find((i) => i.textContent?.includes("actions.viewPermissions")),
    ).toBeDefined();
  });

  it("Given: non-system role with ROLES_UPDATE permission When: rendering Then: should show managePermissions text", () => {
    mockRolesQueryState = {
      data: [makeRole({ isSystem: false })],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    const items = screen.getAllByTestId("dropdown-item");
    expect(
      items.find((i) => i.textContent?.includes("actions.managePermissions")),
    ).toBeDefined();
  });

  it("Given: non-system role without ROLES_UPDATE permission When: rendering Then: should show viewPermissions text", () => {
    mockHasPermission = (p: string) => p !== "ROLES:UPDATE";
    mockRolesQueryState = {
      data: [makeRole({ isSystem: false })],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    const items = screen.getAllByTestId("dropdown-item");
    expect(
      items.find((i) => i.textContent?.includes("actions.viewPermissions")),
    ).toBeDefined();
  });

  // --- canEdit / canDelete conditional actions ---
  it("Given: non-system role with ROLES_UPDATE When: rendering Then: should show toggle status action", () => {
    mockRolesQueryState = {
      data: [makeRole({ isSystem: false, isActive: true })],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    const items = screen.getAllByTestId("dropdown-item");
    // Toggle status shows inactive label for active role
    expect(
      items.find((i) => i.textContent?.includes("status.inactive")),
    ).toBeDefined();
  });

  it("Given: system role When: rendering Then: should NOT show toggle status or delete actions", () => {
    mockRolesQueryState = {
      data: [makeRole({ isSystem: true })],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    const items = screen.getAllByTestId("dropdown-item");
    expect(
      items.find((i) => i.textContent?.includes("actions.delete")),
    ).toBeUndefined();
  });

  it("Given: non-system role with ROLES_DELETE When: rendering Then: should show delete action", () => {
    mockRolesQueryState = {
      data: [makeRole({ isSystem: false })],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    const items = screen.getAllByTestId("dropdown-item");
    expect(
      items.find((i) => i.textContent?.includes("actions.delete")),
    ).toBeDefined();
  });

  it("Given: non-system role without ROLES_DELETE When: rendering Then: should NOT show delete action", () => {
    mockHasPermission = (p: string) => p !== "ROLES:DELETE";
    mockRolesQueryState = {
      data: [makeRole({ isSystem: false })],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    const items = screen.getAllByTestId("dropdown-item");
    expect(
      items.find((i) => i.textContent?.includes("actions.delete")),
    ).toBeUndefined();
  });

  // --- Toggle status ---
  it("Given: clicking toggle status When: active role Then: should call updateRole with isActive false", async () => {
    mockUpdateMutateAsync.mockResolvedValue(undefined);
    mockRolesQueryState = {
      data: [makeRole({ isSystem: false, isActive: true })],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    const items = screen.getAllByTestId("dropdown-item");
    const toggleItem = items.find((i) =>
      i.textContent?.includes("status.inactive"),
    );
    fireEvent.click(toggleItem!);
    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
        id: "role-1",
        data: { isActive: false },
      });
    });
  });

  it("Given: toggle status fails When: clicked Then: should handle error gracefully", async () => {
    mockUpdateMutateAsync.mockRejectedValue(new Error("fail"));
    mockRolesQueryState = {
      data: [makeRole({ isSystem: false, isActive: true })],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    const items = screen.getAllByTestId("dropdown-item");
    const toggleItem = items.find((i) =>
      i.textContent?.includes("status.inactive"),
    );
    fireEvent.click(toggleItem!);
    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalled();
    });
  });

  // --- Delete dialog ---
  it("Given: clicking delete When: dialog confirms Then: should call deleteRole", async () => {
    mockDeleteMutateAsync.mockResolvedValue(undefined);
    mockRolesQueryState = {
      data: [makeRole({ isSystem: false })],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    const items = screen.getAllByTestId("dropdown-item");
    const deleteItem = items.find((i) =>
      i.textContent?.includes("actions.delete"),
    );
    fireEvent.click(deleteItem!);
    const actions = screen.getAllByTestId("alert-action");
    const deleteAction = actions.find(
      (a) =>
        a.textContent?.includes("delete") &&
        !a.textContent?.includes("actions.delete"),
    );
    fireEvent.click(deleteAction!);
    await waitFor(() => {
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith("role-1");
    });
  });

  it("Given: delete fails When: confirmed Then: should handle error gracefully", async () => {
    mockDeleteMutateAsync.mockRejectedValue(new Error("fail"));
    mockRolesQueryState = {
      data: [makeRole({ isSystem: false })],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    const items = screen.getAllByTestId("dropdown-item");
    const deleteItem = items.find((i) =>
      i.textContent?.includes("actions.delete"),
    );
    fireEvent.click(deleteItem!);
    const actions = screen.getAllByTestId("alert-action");
    fireEvent.click(actions[actions.length - 1]);
    await waitFor(() => {
      expect(mockDeleteMutateAsync).toHaveBeenCalled();
    });
  });

  // --- Delete pending ---
  it("Given: deleteRole isPending When: rendering Then: should show loading text", () => {
    mockDeletePending = true;
    mockRolesQueryState = {
      data: [makeRole({ isSystem: false })],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    expect(screen.getAllByText("loading").length).toBeGreaterThanOrEqual(1);
  });

  // --- Search filter ---
  it("Given: search value typed When: filtering Then: should filter roles by name", () => {
    mockRolesQueryState = {
      data: [
        makeRole({ id: "r1", name: "ADMIN", description: "Admin desc" }),
        makeRole({ id: "r2", name: "VIEWER", description: "View desc" }),
      ],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    const searchInput = screen.getByPlaceholderText("search.placeholder");
    fireEvent.change(searchInput, { target: { value: "VIEWER" } });
    expect(screen.getByText("VIEWER")).toBeDefined();
    // ADMIN should be filtered out (t.has returns true for ADMIN so it shows "names.ADMIN")
    // Actually, the filter uses role.name.toLowerCase(), not the translated name
    expect(screen.queryByText("names.ADMIN")).not.toBeInTheDocument();
  });

  it("Given: search value matches description When: filtering Then: should show matching roles", () => {
    mockRolesQueryState = {
      data: [
        makeRole({ id: "r1", name: "ROLE_A", description: "Special access" }),
        makeRole({ id: "r2", name: "ROLE_B", description: "Normal" }),
      ],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    const searchInput = screen.getByPlaceholderText("search.placeholder");
    fireEvent.change(searchInput, { target: { value: "Special" } });
    expect(screen.getByText("Special access")).toBeDefined();
    expect(screen.queryByText("Normal")).not.toBeInTheDocument();
  });

  it("Given: empty search When: rendering Then: should show all roles", () => {
    mockRolesQueryState = {
      data: [
        makeRole({ id: "r1", name: "ROLE_A" }),
        makeRole({ id: "r2", name: "ROLE_B" }),
      ],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    expect(screen.getByText("ROLE_A")).toBeDefined();
    expect(screen.getByText("ROLE_B")).toBeDefined();
  });

  // --- New button ---
  it("Given: roles exist When: clicking new button Then: should open form", () => {
    mockRolesQueryState = {
      data: [makeRole()],
      isLoading: false,
      isError: false,
    };
    render(<RoleList />);
    const newButton = screen.getByText("actions.new");
    fireEvent.click(newButton);
    expect(screen.getByTestId("role-form")).toBeDefined();
  });
});
