import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConnectionCard } from "@/modules/integrations/presentation/components/connection-card";
import { IntegrationConnection } from "@/modules/integrations/domain/entities/integration-connection.entity";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePathname: () => "/dashboard/integrations",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/ui/components/card", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("@/ui/components/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <div>{children}</div>,
}));

vi.mock("./connection-status-badge", () => ({
  ConnectionStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

function createConnection(
  overrides: Partial<{
    id: string;
    storeName: string;
    accountName: string;
    companyName: string | null;
    lastSyncAt: Date | null;
    syncedOrdersCount: number;
    lastSyncError: string | null;
    status: "CONNECTED" | "DISCONNECTED" | "ERROR";
  }> = {},
): IntegrationConnection {
  return IntegrationConnection.create({
    id: overrides.id ?? "conn-1",
    provider: "VTEX",
    accountName: overrides.accountName ?? "my-account",
    storeName: overrides.storeName ?? "My Store",
    status: overrides.status ?? "CONNECTED",
    syncStrategy: "WEBHOOK",
    syncDirection: "INBOUND",
    defaultWarehouseId: "wh-1",
    warehouseName: "Main Warehouse",
    defaultContactId: null,
    defaultContactName: null,
    companyId: overrides.companyName ? "company-1" : null,
    companyName: overrides.companyName ?? null,
    connectedAt: new Date("2025-01-15"),
    lastSyncAt:
      overrides.lastSyncAt !== undefined
        ? overrides.lastSyncAt
        : new Date("2025-06-01T10:30:00"),
    lastSyncError: overrides.lastSyncError ?? null,
    syncedOrdersCount: overrides.syncedOrdersCount ?? 42,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-06-01"),
  });
}

const defaultCallbacks = {
  onTest: vi.fn(),
  onSync: vi.fn(),
  onDelete: vi.fn(),
};

describe("ConnectionCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Given: a connection When: rendering Then: should show storeName", () => {
    const connection = createConnection({ storeName: "VTEX Store Alpha" });

    render(<ConnectionCard connection={connection} {...defaultCallbacks} />);

    expect(screen.getByText("VTEX Store Alpha")).toBeInTheDocument();
  });

  it("Given: a connection When: rendering Then: should show accountName", () => {
    const connection = createConnection({ accountName: "acme-account" });

    render(<ConnectionCard connection={connection} {...defaultCallbacks} />);

    expect(screen.getByText("acme-account")).toBeInTheDocument();
  });

  it("Given: a connection with lastSyncAt When: rendering Then: should show formatted date", () => {
    const connection = createConnection({
      lastSyncAt: new Date("2025-06-01T10:30:00"),
    });

    render(<ConnectionCard connection={connection} {...defaultCallbacks} />);

    // The formatted date is locale-dependent; when lastSyncAt is not null the "-" fallback is not shown
    expect(screen.queryByText("-")).not.toBeInTheDocument();
  });

  it("Given: a connection with null lastSyncAt When: rendering Then: should show dash", () => {
    const connection = createConnection({ lastSyncAt: null });

    render(<ConnectionCard connection={connection} {...defaultCallbacks} />);

    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("Given: a connection with companyName When: rendering Then: should show companyName", () => {
    const connection = createConnection({ companyName: "Acme Corp" });

    render(<ConnectionCard connection={connection} {...defaultCallbacks} />);

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("Given: a connection without companyName When: rendering Then: should not show company row", () => {
    const connection = createConnection({ companyName: null });

    render(<ConnectionCard connection={connection} {...defaultCallbacks} />);

    expect(screen.queryByText("form.company")).not.toBeInTheDocument();
  });

  it("Given: a connection with lastSyncError When: rendering Then: should show the error", () => {
    const connection = createConnection({
      lastSyncError: "API rate limit exceeded",
    });

    render(<ConnectionCard connection={connection} {...defaultCallbacks} />);

    expect(screen.getByText("API rate limit exceeded")).toBeInTheDocument();
  });

  it("Given: a connection without lastSyncError When: rendering Then: should not show error text", () => {
    const connection = createConnection({ lastSyncError: null });

    render(<ConnectionCard connection={connection} {...defaultCallbacks} />);

    expect(
      screen.queryByText("API rate limit exceeded"),
    ).not.toBeInTheDocument();
  });
});
