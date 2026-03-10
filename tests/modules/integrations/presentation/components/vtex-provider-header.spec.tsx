import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { VtexProviderHeader } from "@/modules/integrations/presentation/components/vtex-provider-header";
import { IntegrationConnection } from "@/modules/integrations/domain/entities/integration-connection.entity";
import type { ConnectionStatus } from "@/modules/integrations/domain/entities/integration-connection.entity";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
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
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
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

function createConnection(
  status: ConnectionStatus,
  id: string,
): IntegrationConnection {
  return IntegrationConnection.create({
    id,
    provider: "VTEX",
    accountName: "account",
    storeName: "store",
    status,
    syncStrategy: "WEBHOOK",
    syncDirection: "INBOUND",
    defaultWarehouseId: "wh-1",
    warehouseName: null,
    defaultContactId: null,
    defaultContactName: null,
    companyId: null,
    companyName: null,
    connectedAt: null,
    lastSyncAt: null,
    lastSyncError: null,
    syncedOrdersCount: 0,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  });
}

describe("VtexProviderHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Given: connections array When: rendering Then: should show provider name", () => {
    const connections = [createConnection("CONNECTED", "1")];

    render(<VtexProviderHeader connections={connections} />);

    expect(screen.getByText("providers.vtex.name")).toBeInTheDocument();
  });

  it("Given: 3 connections When: rendering Then: should show total connections count", () => {
    const connections = [
      createConnection("CONNECTED", "1"),
      createConnection("DISCONNECTED", "2"),
      createConnection("ERROR", "3"),
    ];

    render(<VtexProviderHeader connections={connections} />);

    expect(
      screen.getByText('stats.totalConnections:{"count":3}'),
    ).toBeInTheDocument();
  });

  it("Given: 2 connected connections When: rendering Then: should show connected badge", () => {
    const connections = [
      createConnection("CONNECTED", "1"),
      createConnection("CONNECTED", "2"),
      createConnection("DISCONNECTED", "3"),
    ];

    render(<VtexProviderHeader connections={connections} />);

    expect(screen.getByText('stats.connected:{"count":2}')).toBeInTheDocument();
  });

  it("Given: 0 connected connections When: rendering Then: should not show connected badge", () => {
    const connections = [
      createConnection("DISCONNECTED", "1"),
      createConnection("ERROR", "2"),
    ];

    render(<VtexProviderHeader connections={connections} />);

    expect(screen.queryByText(/stats\.connected/)).not.toBeInTheDocument();
  });

  it("Given: connections with errors When: rendering Then: should show errors badge", () => {
    const connections = [
      createConnection("CONNECTED", "1"),
      createConnection("ERROR", "2"),
      createConnection("ERROR", "3"),
    ];

    render(<VtexProviderHeader connections={connections} />);

    expect(
      screen.getByText('stats.withErrors:{"count":2}'),
    ).toBeInTheDocument();
  });

  it("Given: no connections with errors When: rendering Then: should not show errors badge", () => {
    const connections = [
      createConnection("CONNECTED", "1"),
      createConnection("DISCONNECTED", "2"),
    ];

    render(<VtexProviderHeader connections={connections} />);

    expect(screen.queryByText(/stats\.withErrors/)).not.toBeInTheDocument();
  });
});
