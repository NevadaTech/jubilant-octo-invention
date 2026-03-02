import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuditLogDetailDialog } from "@/modules/audit/presentation/components/audit-log-detail-dialog";
import { AuditLog } from "@/modules/audit/domain/entities/audit-log.entity";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock("@/ui/components/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
}));

vi.mock("@/modules/audit/presentation/components/audit-action-badge", () => ({
  AuditActionBadge: ({ action }: { action: string }) => (
    <span data-testid="action-badge">{action}</span>
  ),
}));

vi.mock("@/modules/audit/presentation/components/audit-method-badge", () => ({
  AuditMethodBadge: ({ method }: { method: string }) => (
    <span data-testid="method-badge">{method}</span>
  ),
}));

vi.mock(
  "@/modules/audit/presentation/components/audit-status-indicator",
  () => ({
    AuditStatusIndicator: ({ statusCode }: { statusCode: number }) => (
      <span data-testid="status-indicator">{statusCode}</span>
    ),
  }),
);

// --- Helpers ---

function makeAuditLog(
  overrides: Partial<{
    id: string;
    entityType: string;
    action: string;
    performedBy: string | null;
    httpMethod: string | null;
    httpUrl: string | null;
    httpStatusCode: number | null;
    duration: number | null;
    ipAddress: string | null;
    userAgent: string | null;
    metadata: Record<string, unknown>;
  }> = {},
): AuditLog {
  return AuditLog.create({
    id: overrides.id ?? "log-1",
    orgId: "org-1",
    entityType: overrides.entityType ?? "Product",
    entityId: "entity-1",
    action: overrides.action ?? "CREATE",
    performedBy: overrides.performedBy ?? "user-1",
    metadata: overrides.metadata ?? {},
    ipAddress: overrides.ipAddress ?? "192.168.1.1",
    userAgent: overrides.userAgent ?? "Mozilla/5.0",
    httpMethod: overrides.httpMethod ?? "POST",
    httpUrl: overrides.httpUrl ?? "/api/products",
    httpStatusCode: overrides.httpStatusCode ?? 201,
    duration: overrides.duration ?? 45,
    createdAt: new Date("2026-02-25T12:00:00Z"),
  });
}

const defaultUserNameMap = new Map<string, string>([
  ["user-1", "Alice Johnson"],
  ["user-2", "Bob Smith"],
]);

// --- Tests ---

describe("AuditLogDetailDialog", () => {
  it("Given: auditLog is null When: rendering Then: should return null (nothing rendered)", () => {
    // Arrange & Act
    const { container } = render(
      <AuditLogDetailDialog
        auditLog={null}
        userNameMap={defaultUserNameMap}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    // Assert
    expect(container.innerHTML).toBe("");
  });

  it("Given: open is false When: rendering with auditLog Then: dialog should not be visible", () => {
    // Arrange
    const log = makeAuditLog();

    // Act
    render(
      <AuditLogDetailDialog
        auditLog={log}
        userNameMap={defaultUserNameMap}
        open={false}
        onOpenChange={vi.fn()}
      />,
    );

    // Assert — Dialog mock returns null when open=false
    expect(screen.queryByTestId("dialog")).toBeNull();
  });

  it("Given: open is true with full audit log When: rendering Then: should display dialog title and main info", () => {
    // Arrange
    const log = makeAuditLog({
      entityType: "Sale",
      action: "UPDATE",
      performedBy: "user-1",
    });

    // Act
    render(
      <AuditLogDetailDialog
        auditLog={log}
        userNameMap={defaultUserNameMap}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByTestId("dialog-title")).toBeDefined();
    expect(screen.getByText("detail.title")).toBeDefined();
    expect(screen.getByText("Sale")).toBeDefined();
    expect(screen.getByTestId("action-badge")).toBeDefined();
    expect(screen.getByText("UPDATE")).toBeDefined();
    // performedBy resolved via userNameMap
    expect(screen.getByText("Alice Johnson")).toBeDefined();
  });

  it("Given: audit log with HTTP details When: rendering Then: should display method badge, status indicator, URL, and duration", () => {
    // Arrange
    const log = makeAuditLog({
      httpMethod: "DELETE",
      httpUrl: "/api/sales/123",
      httpStatusCode: 200,
      duration: 250,
    });

    // Act
    render(
      <AuditLogDetailDialog
        auditLog={log}
        userNameMap={defaultUserNameMap}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByText("detail.httpDetails")).toBeDefined();
    expect(screen.getByTestId("method-badge")).toBeDefined();
    expect(screen.getByText("DELETE")).toBeDefined();
    expect(screen.getByTestId("status-indicator")).toBeDefined();
    expect(screen.getByText("200")).toBeDefined();
    expect(screen.getByText("/api/sales/123")).toBeDefined();
    expect(screen.getByText(/250ms/)).toBeDefined();
  });

  it("Given: audit log with network info When: rendering Then: should display IP address and user agent", () => {
    // Arrange
    const log = makeAuditLog({
      ipAddress: "10.0.0.42",
      userAgent: "Custom-Agent/1.0",
    });

    // Act
    render(
      <AuditLogDetailDialog
        auditLog={log}
        userNameMap={defaultUserNameMap}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByText("detail.networkInfo")).toBeDefined();
    expect(screen.getByText("10.0.0.42")).toBeDefined();
    expect(screen.getByText("Custom-Agent/1.0")).toBeDefined();
  });

  it("Given: audit log with non-empty metadata When: rendering Then: should display metadata section with JSON", () => {
    // Arrange
    const log = makeAuditLog({
      metadata: { previousStatus: "DRAFT", newStatus: "CONFIRMED" },
    });

    // Act
    render(
      <AuditLogDetailDialog
        auditLog={log}
        userNameMap={defaultUserNameMap}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByText("detail.metadata")).toBeDefined();
    // JSON.stringify with 2-space indent
    const pre = screen.getByText(/previousStatus/);
    expect(pre).toBeDefined();
    expect(pre.textContent).toContain("DRAFT");
    expect(pre.textContent).toContain("CONFIRMED");
  });

  it("Given: audit log with performedBy not in userNameMap When: rendering Then: should display raw performedBy ID", () => {
    // Arrange
    const log = makeAuditLog({ performedBy: "unknown-user-99" });

    // Act
    render(
      <AuditLogDetailDialog
        auditLog={log}
        userNameMap={defaultUserNameMap}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    // Assert — falls back to raw ID
    expect(screen.getByText("unknown-user-99")).toBeDefined();
  });
});
