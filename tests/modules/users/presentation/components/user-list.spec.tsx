import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserList } from "@/modules/users/presentation/components/user-list";
import { User } from "@/modules/users/domain/entities/user.entity";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
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
    USERS_CREATE: "USERS:CREATE",
    USERS_UPDATE: "USERS:UPDATE",
    USERS_MANAGE_ROLES: "USERS:MANAGE_ROLES",
  },
}));

const mockChangeStatusMutateAsync = vi.fn();

let mockQueryState: {
  data:
    | {
        data: User[];
        pagination: {
          page: number;
          totalPages: number;
          total: number;
          limit: number;
        };
      }
    | undefined;
  isLoading: boolean;
  isError: boolean;
} = { data: undefined, isLoading: false, isError: false };

vi.mock("@/modules/users/presentation/hooks/use-users", () => ({
  useUsers: () => mockQueryState,
  useChangeUserStatus: () => ({
    isPending: false,
    mutateAsync: mockChangeStatusMutateAsync,
  }),
}));

vi.mock("@/modules/users/presentation/components/user-status-badge", () => ({
  UserStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

vi.mock("@/modules/users/presentation/components/user-filters", () => ({
  UserFiltersComponent: () => <div data-testid="user-filters" />,
}));

vi.mock("@/modules/users/presentation/components/user-form", () => ({
  UserForm: ({
    open,
    onOpenChange,
  }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
  }) => (
    <div data-testid="user-form" data-open={open}>
      <button data-testid="close-form" onClick={() => onOpenChange(false)} />
    </div>
  ),
}));

vi.mock("@/modules/users/presentation/components/user-roles-dialog", () => ({
  UserRolesDialog: ({
    open,
    user,
  }: {
    open: boolean;
    user: unknown;
    onOpenChange: (v: boolean) => void;
  }) => (
    <div data-testid="user-roles-dialog" data-open={open}>
      {user ? "has-user" : "no-user"}
    </div>
  ),
}));

vi.mock("@/ui/components/table-pagination", () => ({
  TablePagination: ({
    onPageChange,
    onPageSizeChange,
  }: {
    onPageChange: (p: number) => void;
    onPageSizeChange: (s: number) => void;
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    showingLabel: string;
  }) => (
    <div data-testid="table-pagination">
      <button data-testid="next-page" onClick={() => onPageChange(2)} />
      <button data-testid="page-size" onClick={() => onPageSizeChange(20)} />
    </div>
  ),
}));

vi.mock("@/ui/components/sortable-header", () => ({
  SortableHeader: ({
    label,
    field,
    onSort,
  }: {
    label: string;
    field: string;
    onSort: (field: string, order: "asc" | "desc" | undefined) => void;
  }) => (
    <th data-testid={`sortable-${field}`}>
      <button onClick={() => onSort(field, "asc")}>{label}</button>
    </th>
  ),
}));

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

// --- Helpers ---

function makeUser(
  overrides: Partial<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    status: "ACTIVE" | "INACTIVE" | "LOCKED";
    lastLoginAt: Date | null;
  }> = {},
): User {
  return User.create({
    id: overrides.id ?? "user-1",
    email: overrides.email ?? "john@example.com",
    username: overrides.username ?? "johndoe",
    firstName: overrides.firstName ?? "John",
    lastName: overrides.lastName ?? "Doe",
    status: overrides.status ?? "ACTIVE",
    roles: ["ADMIN"],
    lastLoginAt:
      "lastLoginAt" in overrides
        ? (overrides.lastLoginAt ?? null)
        : new Date("2026-02-20T09:00:00Z"),
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-20T09:00:00Z"),
  });
}

// --- Tests ---

describe("UserList", () => {
  beforeEach(() => {
    mockQueryState = { data: undefined, isLoading: false, isError: false };
    mockHasPermission = () => true;
    mockChangeStatusMutateAsync.mockReset();
  });

  // --- Loading ---
  it("Given: loading state When: rendering Then: should show skeleton placeholders", () => {
    mockQueryState = { data: undefined, isLoading: true, isError: false };
    const { container } = render(<UserList />);
    const skeletons = container.querySelectorAll(".h-16");
    expect(skeletons.length).toBe(5);
  });

  // --- Error ---
  it("Given: error state When: rendering Then: should show error message", () => {
    mockQueryState = { data: undefined, isLoading: false, isError: true };
    render(<UserList />);
    expect(screen.getByText("error.loading")).toBeDefined();
  });

  it("Given: error state When: rendering Then: should not show list title", () => {
    mockQueryState = { data: undefined, isLoading: false, isError: true };
    render(<UserList />);
    expect(screen.queryByText("list.title")).not.toBeInTheDocument();
  });

  // --- Empty ---
  it("Given: no users When: rendering Then: should show empty state", () => {
    mockQueryState = {
      data: {
        data: [],
        pagination: { page: 1, totalPages: 0, total: 0, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    expect(screen.getByText("empty.title")).toBeDefined();
    expect(screen.getByText("empty.description")).toBeDefined();
  });

  // --- Data display ---
  it("Given: users exist When: rendering Then: should display list title", () => {
    mockQueryState = {
      data: {
        data: [makeUser()],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    expect(screen.getByText("list.title")).toBeDefined();
  });

  it("Given: users exist When: rendering Then: should render full name, email, username", () => {
    const u1 = makeUser({
      id: "u1",
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@test.com",
      username: "asmith",
    });
    mockQueryState = {
      data: {
        data: [u1],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    expect(screen.getByText("Alice Smith")).toBeDefined();
    expect(screen.getByText("alice@test.com")).toBeDefined();
    expect(screen.getByText("asmith")).toBeDefined();
  });

  it("Given: user with lastLoginAt When: rendering Then: should show formatted date", () => {
    const user = makeUser();
    mockQueryState = {
      data: {
        data: [user],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    // lastLoginAt is Feb 20, 2026 -- should render as "Feb 20, 2026" format
    expect(screen.queryByText("-")).not.toBeInTheDocument();
  });

  it("Given: user with null lastLoginAt When: rendering Then: should show dash", () => {
    const user = makeUser({ lastLoginAt: null });
    mockQueryState = {
      data: {
        data: [user],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    expect(screen.getByText("-")).toBeDefined();
  });

  it("Given: users exist When: rendering Then: should show status badges", () => {
    const user = makeUser({ status: "ACTIVE" });
    mockQueryState = {
      data: {
        data: [user],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    expect(screen.getByText("ACTIVE")).toBeDefined();
  });

  // --- Conditional menu items based on permissions ---
  it("Given: USERS_MANAGE_ROLES permission When: rendering Then: should show manage roles action", () => {
    mockQueryState = {
      data: {
        data: [makeUser()],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    const items = screen.getAllByTestId("dropdown-item");
    const rolesItem = items.find((i) =>
      i.textContent?.includes("actions.manageRoles"),
    );
    expect(rolesItem).toBeDefined();
  });

  it("Given: no USERS_MANAGE_ROLES permission When: rendering Then: should NOT show manage roles action", () => {
    mockHasPermission = (p: string) => p !== "USERS:MANAGE_ROLES";
    mockQueryState = {
      data: {
        data: [makeUser()],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    const items = screen.getAllByTestId("dropdown-item");
    const rolesItem = items.find((i) =>
      i.textContent?.includes("actions.manageRoles"),
    );
    expect(rolesItem).toBeUndefined();
  });

  // --- isActive / isLocked conditional actions ---
  it("Given: ACTIVE user with USERS_UPDATE permission When: rendering Then: should show deactivate and lock actions", () => {
    mockQueryState = {
      data: {
        data: [makeUser({ status: "ACTIVE" })],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    const items = screen.getAllByTestId("dropdown-item");
    expect(
      items.find((i) => i.textContent?.includes("actions.deactivate")),
    ).toBeDefined();
    expect(
      items.find((i) => i.textContent?.includes("actions.lock")),
    ).toBeDefined();
  });

  it("Given: ACTIVE user When: rendering Then: should NOT show activate action", () => {
    mockQueryState = {
      data: {
        data: [makeUser({ status: "ACTIVE" })],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    const items = screen.getAllByTestId("dropdown-item");
    expect(
      items.find((i) => i.textContent?.includes("actions.activate")),
    ).toBeUndefined();
  });

  it("Given: INACTIVE user When: rendering Then: should show activate and lock actions", () => {
    mockQueryState = {
      data: {
        data: [makeUser({ status: "INACTIVE" })],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    const items = screen.getAllByTestId("dropdown-item");
    expect(
      items.find((i) => i.textContent?.includes("actions.activate")),
    ).toBeDefined();
    expect(
      items.find((i) => i.textContent?.includes("actions.lock")),
    ).toBeDefined();
  });

  it("Given: LOCKED user When: rendering Then: should show activate and NOT show lock again", () => {
    mockQueryState = {
      data: {
        data: [makeUser({ status: "LOCKED" })],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    const items = screen.getAllByTestId("dropdown-item");
    expect(
      items.find((i) => i.textContent?.includes("actions.activate")),
    ).toBeDefined();
    expect(
      items.find((i) => i.textContent?.includes("actions.lock")),
    ).toBeUndefined();
  });

  it("Given: no USERS_UPDATE permission When: rendering Then: should NOT show status actions", () => {
    mockHasPermission = (p: string) => p !== "USERS:UPDATE";
    mockQueryState = {
      data: {
        data: [makeUser({ status: "ACTIVE" })],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    const items = screen.getAllByTestId("dropdown-item");
    expect(
      items.find((i) => i.textContent?.includes("actions.deactivate")),
    ).toBeUndefined();
    expect(
      items.find((i) => i.textContent?.includes("actions.lock")),
    ).toBeUndefined();
  });

  // --- Change status ---
  it("Given: clicking deactivate When: action clicked Then: should call changeStatus with INACTIVE", async () => {
    mockChangeStatusMutateAsync.mockResolvedValue(undefined);
    mockQueryState = {
      data: {
        data: [makeUser({ status: "ACTIVE" })],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    const items = screen.getAllByTestId("dropdown-item");
    const deactivateItem = items.find((i) =>
      i.textContent?.includes("actions.deactivate"),
    );
    fireEvent.click(deactivateItem!);
    await waitFor(() => {
      expect(mockChangeStatusMutateAsync).toHaveBeenCalledWith({
        id: "user-1",
        data: { status: "INACTIVE" },
      });
    });
  });

  it("Given: clicking activate When: action clicked Then: should call changeStatus with ACTIVE", async () => {
    mockChangeStatusMutateAsync.mockResolvedValue(undefined);
    mockQueryState = {
      data: {
        data: [makeUser({ status: "INACTIVE" })],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    const items = screen.getAllByTestId("dropdown-item");
    const activateItem = items.find((i) =>
      i.textContent?.includes("actions.activate"),
    );
    fireEvent.click(activateItem!);
    await waitFor(() => {
      expect(mockChangeStatusMutateAsync).toHaveBeenCalledWith({
        id: "user-1",
        data: { status: "ACTIVE" },
      });
    });
  });

  it("Given: clicking lock When: action clicked Then: should call changeStatus with LOCKED", async () => {
    mockChangeStatusMutateAsync.mockResolvedValue(undefined);
    mockQueryState = {
      data: {
        data: [makeUser({ status: "ACTIVE" })],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    const items = screen.getAllByTestId("dropdown-item");
    const lockItem = items.find((i) => i.textContent?.includes("actions.lock"));
    fireEvent.click(lockItem!);
    await waitFor(() => {
      expect(mockChangeStatusMutateAsync).toHaveBeenCalledWith({
        id: "user-1",
        data: { status: "LOCKED" },
      });
    });
  });

  it("Given: changeStatus fails When: action clicked Then: should handle error gracefully", async () => {
    mockChangeStatusMutateAsync.mockRejectedValue(new Error("fail"));
    mockQueryState = {
      data: {
        data: [makeUser({ status: "ACTIVE" })],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    const items = screen.getAllByTestId("dropdown-item");
    const lockItem = items.find((i) => i.textContent?.includes("actions.lock"));
    fireEvent.click(lockItem!);
    await waitFor(() => {
      expect(mockChangeStatusMutateAsync).toHaveBeenCalled();
    });
  });

  // --- New button and form ---
  it("Given: users exist When: clicking new button Then: should open user form", () => {
    mockQueryState = {
      data: {
        data: [makeUser()],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    const newButton = screen.getByText("actions.new");
    fireEvent.click(newButton);
    expect(screen.getByTestId("user-form")).toBeDefined();
  });

  // --- Manage roles dialog ---
  it("Given: clicking manage roles When: action clicked Then: should open roles dialog", () => {
    mockQueryState = {
      data: {
        data: [makeUser()],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    const items = screen.getAllByTestId("dropdown-item");
    const rolesItem = items.find((i) =>
      i.textContent?.includes("actions.manageRoles"),
    );
    fireEvent.click(rolesItem!);
    expect(screen.getByTestId("user-roles-dialog")).toBeDefined();
  });

  // --- Pagination ---
  it("Given: users data When: clicking next page Then: should not crash", () => {
    mockQueryState = {
      data: {
        data: [makeUser()],
        pagination: { page: 1, totalPages: 2, total: 15, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    fireEvent.click(screen.getByTestId("next-page"));
    expect(screen.getByTestId("table-pagination")).toBeDefined();
  });

  it("Given: users data When: changing page size Then: should not crash", () => {
    mockQueryState = {
      data: {
        data: [makeUser()],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    fireEvent.click(screen.getByTestId("page-size"));
    expect(screen.getByTestId("table-pagination")).toBeDefined();
  });

  // --- Sorting ---
  it("Given: users data When: clicking sortable header Then: should update sort", () => {
    mockQueryState = {
      data: {
        data: [makeUser()],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<UserList />);
    const header = screen.getByTestId("sortable-firstName");
    fireEvent.click(header.querySelector("button")!);
    expect(screen.getByText("John Doe")).toBeDefined();
  });
});
