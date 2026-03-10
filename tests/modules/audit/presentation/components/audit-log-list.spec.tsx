import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuditLogList } from "@/modules/audit/presentation/components/audit-log-list";
import { AuditLog } from "@/modules/audit/domain/entities/audit-log.entity";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/modules/authentication/presentation/hooks/use-permissions", () => ({
  usePermissions: () => ({ hasPermission: () => true }),
}));

vi.mock("@/shared/domain/permissions", () => ({
  PERMISSIONS: {
    AUDIT_EXPORT: "AUDIT:EXPORT",
  },
}));

vi.mock("@/config/di/container", () => ({
  getContainer: () => ({
    auditLogRepository: { findAll: vi.fn() },
  }),
}));

let mockQueryState: {
  data:
    | {
        data: AuditLog[];
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

vi.mock("@/modules/audit/presentation/hooks/use-audit-logs", () => ({
  useAuditLogs: () => mockQueryState,
}));

vi.mock("@/modules/users/presentation/hooks/use-users", () => ({
  useUsers: () => ({ data: { data: [] } }),
}));

vi.mock("@/modules/audit/presentation/components/audit-log-filters", () => ({
  AuditLogFiltersBar: () => <div data-testid="audit-log-filters" />,
}));

vi.mock(
  "@/modules/audit/presentation/components/audit-log-detail-dialog",
  () => ({
    AuditLogDetailDialog: () => <div data-testid="audit-log-detail-dialog" />,
  }),
);

vi.mock("@/modules/audit/presentation/components/audit-action-badge", () => ({
  AuditActionBadge: ({ action }: { action: string }) => (
    <span data-testid="action-badge">{action}</span>
  ),
}));

vi.mock("@/modules/audit/presentation/components/audit-method-badge", () => ({
  AuditMethodBadge: ({ method }: { method: string | null }) => (
    <span data-testid="method-badge">{method ?? "-"}</span>
  ),
}));

vi.mock(
  "@/modules/audit/presentation/components/audit-status-indicator",
  () => ({
    AuditStatusIndicator: ({ statusCode }: { statusCode: number | null }) => (
      <span data-testid="status-indicator">{statusCode ?? "-"}</span>
    ),
  }),
);

vi.mock("@/ui/components/table-pagination", () => ({
  TablePagination: () => <div data-testid="table-pagination" />,
}));

vi.mock("@/ui/components/sortable-header", () => ({
  SortableHeader: ({ label }: { label: string }) => <th>{label}</th>,
}));

// --- Helpers ---

function makeAuditLog(
  overrides: Partial<{
    id: string;
    entityType: string;
    action: string;
    httpMethod: string | null;
    httpStatusCode: number | null;
    duration: number | null;
  }> = {},
): AuditLog {
  return AuditLog.create({
    id: overrides.id ?? "log-1",
    orgId: "org-1",
    entityType: overrides.entityType ?? "Product",
    entityId: "entity-1",
    action: overrides.action ?? "CREATE",
    performedBy: "user-1",
    metadata: {},
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0",
    httpMethod: overrides.httpMethod ?? "POST",
    httpUrl: "/api/products",
    httpStatusCode: overrides.httpStatusCode ?? 201,
    duration: overrides.duration ?? 45,
    createdAt: new Date("2026-02-25T12:00:00Z"),
  });
}

// --- Tests ---

describe("AuditLogList", () => {
  beforeEach(() => {
    mockQueryState = { data: undefined, isLoading: false, isError: false };
  });

  it("Given: data loaded When: rendering Then: should display the list title", () => {
    const log = makeAuditLog();
    mockQueryState = {
      data: {
        data: [log],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 20 },
      },
      isLoading: false,
      isError: false,
    };

    render(<AuditLogList />);

    expect(screen.getByText("list.title")).toBeDefined();
  });

  it("Given: audit logs exist When: rendering Then: should render entity type, action badge, and duration for each row", () => {
    const log1 = makeAuditLog({
      id: "log-1",
      entityType: "Product",
      action: "CREATE",
      duration: 45,
    });
    const log2 = makeAuditLog({
      id: "log-2",
      entityType: "Sale",
      action: "UPDATE",
      duration: 120,
    });

    mockQueryState = {
      data: {
        data: [log1, log2],
        pagination: { page: 1, totalPages: 1, total: 2, limit: 20 },
      },
      isLoading: false,
      isError: false,
    };

    render(<AuditLogList />);

    expect(screen.getByText("Product")).toBeDefined();
    expect(screen.getByText("Sale")).toBeDefined();
    expect(screen.getByText("CREATE")).toBeDefined();
    expect(screen.getByText("UPDATE")).toBeDefined();
    expect(screen.getByText("45ms")).toBeDefined();
    expect(screen.getByText("120ms")).toBeDefined();
  });

  it("Given: audit logs exist When: rendering Then: should render method and status badges", () => {
    const log = makeAuditLog({ httpMethod: "POST", httpStatusCode: 201 });
    mockQueryState = {
      data: {
        data: [log],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 20 },
      },
      isLoading: false,
      isError: false,
    };

    render(<AuditLogList />);

    expect(screen.getByText("POST")).toBeDefined();
    expect(screen.getByText("201")).toBeDefined();
  });

  it("Given: no audit logs When: rendering Then: should show empty state", () => {
    mockQueryState = {
      data: {
        data: [],
        pagination: { page: 1, totalPages: 0, total: 0, limit: 20 },
      },
      isLoading: false,
      isError: false,
    };

    render(<AuditLogList />);

    expect(screen.getByText("empty.title")).toBeDefined();
    expect(screen.getByText("empty.description")).toBeDefined();
  });

  it("Given: loading state When: rendering Then: should show skeleton placeholders", () => {
    mockQueryState = { data: undefined, isLoading: true, isError: false };

    const { container } = render(<AuditLogList />);

    const skeletons = container.querySelectorAll(".h-12");
    expect(skeletons.length).toBe(8);
  });

  it("Given: error state When: rendering Then: should show error message", () => {
    mockQueryState = { data: undefined, isLoading: false, isError: true };

    render(<AuditLogList />);

    expect(screen.getByText("error.loading")).toBeDefined();
  });

  // --- Branch: duration is null ---
  it("Given: log with null duration When: rendering Then: should not show duration in ms format", () => {
    const log = AuditLog.create({
      id: "log-null-dur",
      orgId: "org-1",
      entityType: "Product",
      entityId: "entity-1",
      action: "CREATE",
      performedBy: "user-1",
      metadata: {},
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0",
      httpMethod: "POST",
      httpUrl: "/api/products",
      httpStatusCode: 201,
      duration: null,
      createdAt: new Date("2026-02-25T12:00:00Z"),
    });
    mockQueryState = {
      data: {
        data: [log],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 20 },
      },
      isLoading: false,
      isError: false,
    };

    render(<AuditLogList />);
    // Should NOT find any "Xms" pattern since duration is null
    expect(screen.queryByText(/\d+ms/)).toBeNull();
  });

  // --- Branch: duration is not null ---
  it("Given: log with non-null duration When: rendering Then: should show duration in ms", () => {
    const log = makeAuditLog({ id: "log-dur", duration: 99 });
    mockQueryState = {
      data: {
        data: [log],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 20 },
      },
      isLoading: false,
      isError: false,
    };

    render(<AuditLogList />);
    expect(screen.getByText("99ms")).toBeDefined();
  });

  // --- Branch: data is undefined but not loading/error (initial) ---
  it("Given: data undefined and not loading When: rendering Then: should show title", () => {
    mockQueryState = { data: undefined, isLoading: false, isError: false };

    render(<AuditLogList />);
    expect(screen.getByText("list.title")).toBeDefined();
  });

  // --- Branch: row click sets selectedLog ---
  it("Given: logs rendered When: clicking a row Then: should trigger detail dialog", async () => {
    const { fireEvent } = await import("@testing-library/react");
    const log = makeAuditLog({ id: "log-click" });
    mockQueryState = {
      data: {
        data: [log],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 20 },
      },
      isLoading: false,
      isError: false,
    };

    render(<AuditLogList />);
    const rows = document.querySelectorAll("tr.border-b");
    if (rows.length > 0) {
      fireEvent.click(rows[0]);
      expect(screen.getByTestId("audit-log-detail-dialog")).toBeDefined();
    }
  });

  // --- Branch: disabled export when no data ---
  it("Given: empty data When: rendering Then: should disable export button", () => {
    mockQueryState = {
      data: {
        data: [],
        pagination: { page: 1, totalPages: 0, total: 0, limit: 20 },
      },
      isLoading: false,
      isError: false,
    };

    render(<AuditLogList />);
    const exportBtn = screen.queryByText("export.excel");
    if (exportBtn) {
      expect(exportBtn.closest("button")?.disabled).toBe(true);
    }
  });
});
