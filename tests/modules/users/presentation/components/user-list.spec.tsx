import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserList } from "@/modules/users/presentation/components/user-list";
import { User } from "@/modules/users/domain/entities/user.entity";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock("@/shared/presentation/components/permission-gate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/modules/authentication/presentation/hooks/use-permissions", () => ({
  usePermissions: () => ({ hasPermission: () => true }),
}));

vi.mock("@/shared/domain/permissions", () => ({
  PERMISSIONS: {
    USERS_CREATE: "USERS:CREATE",
    USERS_UPDATE: "USERS:UPDATE",
    USERS_MANAGE_ROLES: "USERS:MANAGE_ROLES",
  },
}));

let mockQueryState: {
  data: { data: User[]; pagination: { page: number; totalPages: number; total: number; limit: number } } | undefined;
  isLoading: boolean;
  isError: boolean;
} = { data: undefined, isLoading: false, isError: false };

vi.mock("@/modules/users/presentation/hooks/use-users", () => ({
  useUsers: () => mockQueryState,
  useChangeUserStatus: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock("@/modules/users/presentation/components/user-status-badge", () => ({
  UserStatusBadge: ({ status }: { status: string }) => <span data-testid="status-badge">{status}</span>,
}));

vi.mock("@/modules/users/presentation/components/user-filters", () => ({
  UserFiltersComponent: () => <div data-testid="user-filters" />,
}));

vi.mock("@/modules/users/presentation/components/user-form", () => ({
  UserForm: () => <div data-testid="user-form" />,
}));

vi.mock("@/modules/users/presentation/components/user-roles-dialog", () => ({
  UserRolesDialog: () => <div data-testid="user-roles-dialog" />,
}));

vi.mock("@/ui/components/table-pagination", () => ({
  TablePagination: () => <div data-testid="table-pagination" />,
}));

vi.mock("@/ui/components/sortable-header", () => ({
  SortableHeader: ({ label }: { label: string }) => <th>{label}</th>,
}));

// --- Helpers ---

function makeUser(overrides: Partial<{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  status: "ACTIVE" | "INACTIVE" | "LOCKED";
}> = {}): User {
  return User.create({
    id: overrides.id ?? "user-1",
    email: overrides.email ?? "john@example.com",
    username: overrides.username ?? "johndoe",
    firstName: overrides.firstName ?? "John",
    lastName: overrides.lastName ?? "Doe",
    status: overrides.status ?? "ACTIVE",
    roles: ["ADMIN"],
    lastLoginAt: new Date("2026-02-20T09:00:00Z"),
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-20T09:00:00Z"),
  });
}

// --- Tests ---

describe("UserList", () => {
  beforeEach(() => {
    mockQueryState = { data: undefined, isLoading: false, isError: false };
  });

  it("Given: data loaded When: rendering Then: should display the list title", () => {
    const user = makeUser();
    mockQueryState = {
      data: { data: [user], pagination: { page: 1, totalPages: 1, total: 1, limit: 10 } },
      isLoading: false,
      isError: false,
    };

    render(<UserList />);

    expect(screen.getByText("list.title")).toBeDefined();
  });

  it("Given: users exist When: rendering Then: should render full name, email, and username for each row", () => {
    const u1 = makeUser({ id: "u1", firstName: "Alice", lastName: "Smith", email: "alice@test.com", username: "asmith" });
    const u2 = makeUser({ id: "u2", firstName: "Bob", lastName: "Jones", email: "bob@test.com", username: "bjones" });

    mockQueryState = {
      data: { data: [u1, u2], pagination: { page: 1, totalPages: 1, total: 2, limit: 10 } },
      isLoading: false,
      isError: false,
    };

    render(<UserList />);

    expect(screen.getByText("Alice Smith")).toBeDefined();
    expect(screen.getByText("alice@test.com")).toBeDefined();
    expect(screen.getByText("asmith")).toBeDefined();
    expect(screen.getByText("Bob Jones")).toBeDefined();
    expect(screen.getByText("bob@test.com")).toBeDefined();
    expect(screen.getByText("bjones")).toBeDefined();
  });

  it("Given: users exist When: rendering Then: should render status badge for each row", () => {
    const user = makeUser({ status: "ACTIVE" });
    mockQueryState = {
      data: { data: [user], pagination: { page: 1, totalPages: 1, total: 1, limit: 10 } },
      isLoading: false,
      isError: false,
    };

    render(<UserList />);

    expect(screen.getByText("ACTIVE")).toBeDefined();
  });

  it("Given: no users When: rendering Then: should show empty state", () => {
    mockQueryState = {
      data: { data: [], pagination: { page: 1, totalPages: 0, total: 0, limit: 10 } },
      isLoading: false,
      isError: false,
    };

    render(<UserList />);

    expect(screen.getByText("empty.title")).toBeDefined();
    expect(screen.getByText("empty.description")).toBeDefined();
  });

  it("Given: loading state When: rendering Then: should show skeleton placeholders", () => {
    mockQueryState = { data: undefined, isLoading: true, isError: false };

    const { container } = render(<UserList />);

    const skeletons = container.querySelectorAll(".h-16");
    expect(skeletons.length).toBe(5);
  });

  it("Given: error state When: rendering Then: should show error message", () => {
    mockQueryState = { data: undefined, isLoading: false, isError: true };

    render(<UserList />);

    expect(screen.getByText("error.loading")).toBeDefined();
  });
});
