import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MeliProviderHeader } from "@/modules/integrations/presentation/components/meli-provider-header";
import { IntegrationConnection } from "@/modules/integrations/domain/entities/integration-connection.entity";
import type {
  ConnectionStatus,
  TokenStatus,
} from "@/modules/integrations/domain/entities/integration-connection.entity";

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
  tokenStatus: TokenStatus | null = null,
): IntegrationConnection {
  return IntegrationConnection.create({
    id,
    provider: "MERCADOLIBRE",
    accountName: `meli-${id}`,
    storeName: `store-${id}`,
    status,
    syncStrategy: "BOTH",
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
    tokenStatus,
    meliUserId: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  });
}

describe("MeliProviderHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Given: connections array When: rendering Then: should show provider name", () => {
    const connections = [createConnection("CONNECTED", "1")];

    render(<MeliProviderHeader connections={connections} />);

    expect(screen.getByText("providers.mercadolibre.name")).toBeInTheDocument();
  });

  it("Given: connections array When: rendering Then: should show provider description", () => {
    const connections = [createConnection("CONNECTED", "1")];

    render(<MeliProviderHeader connections={connections} />);

    expect(
      screen.getByText("providers.mercadolibre.description"),
    ).toBeInTheDocument();
  });

  it("Given: 3 connections When: rendering Then: should show total connections count", () => {
    const connections = [
      createConnection("CONNECTED", "1"),
      createConnection("DISCONNECTED", "2"),
      createConnection("ERROR", "3"),
    ];

    render(<MeliProviderHeader connections={connections} />);

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

    render(<MeliProviderHeader connections={connections} />);

    expect(screen.getByText('stats.connected:{"count":2}')).toBeInTheDocument();
  });

  it("Given: 0 connected connections When: rendering Then: should not show connected badge", () => {
    const connections = [
      createConnection("DISCONNECTED", "1"),
      createConnection("ERROR", "2"),
    ];

    render(<MeliProviderHeader connections={connections} />);

    expect(screen.queryByText(/stats\.connected/)).not.toBeInTheDocument();
  });

  it("Given: connections with errors When: rendering Then: should show errors badge", () => {
    const connections = [
      createConnection("CONNECTED", "1"),
      createConnection("ERROR", "2"),
      createConnection("ERROR", "3"),
    ];

    render(<MeliProviderHeader connections={connections} />);

    expect(
      screen.getByText('stats.withErrors:{"count":2}'),
    ).toBeInTheDocument();
  });

  it("Given: no connections with errors When: rendering Then: should not show errors badge", () => {
    const connections = [
      createConnection("CONNECTED", "1"),
      createConnection("DISCONNECTED", "2"),
    ];

    render(<MeliProviderHeader connections={connections} />);

    expect(screen.queryByText(/stats\.withErrors/)).not.toBeInTheDocument();
  });

  it("Given: connections needing reauth When: rendering Then: should show needs reauth badge", () => {
    const connections = [
      createConnection("CONNECTED", "1", "VALID"),
      createConnection("CONNECTED", "2", "REAUTH_REQUIRED"),
      createConnection("CONNECTED", "3", "REAUTH_REQUIRED"),
    ];

    render(<MeliProviderHeader connections={connections} />);

    expect(
      screen.getByText('stats.needsReauth:{"count":2}'),
    ).toBeInTheDocument();
  });

  it("Given: no connections needing reauth When: rendering Then: should not show needs reauth badge", () => {
    const connections = [
      createConnection("CONNECTED", "1", "VALID"),
      createConnection("CONNECTED", "2", "VALID"),
    ];

    render(<MeliProviderHeader connections={connections} />);

    expect(screen.queryByText(/stats\.needsReauth/)).not.toBeInTheDocument();
  });

  it("Given: empty connections array When: rendering Then: should show zero total count", () => {
    render(<MeliProviderHeader connections={[]} />);

    expect(
      screen.getByText('stats.totalConnections:{"count":0}'),
    ).toBeInTheDocument();
  });
});
