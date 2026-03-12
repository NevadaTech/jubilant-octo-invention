import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

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

vi.mock(
  "@/modules/integrations/presentation/components/connection-status-badge",
  () => ({
    ConnectionStatusBadge: ({ status }: { status: string }) => (
      <span data-testid="status-badge">{status}</span>
    ),
  }),
);

const mockConnections = [
  {
    id: "conn-1",
    provider: "VTEX",
    accountName: "myaccount",
    storeName: "My VTEX Store",
    status: "CONNECTED" as const,
    isConnected: true,
    companyName: "Acme Corp",
    lastSyncAt: new Date("2026-01-15"),
    lastSyncError: null,
    syncedOrdersCount: 42,
  },
  {
    id: "conn-2",
    provider: "VTEX",
    accountName: "otheraccount",
    storeName: "Other Store",
    status: "DISCONNECTED" as const,
    isConnected: false,
    companyName: null,
    lastSyncAt: null,
    lastSyncError: null,
    syncedOrdersCount: 0,
  },
];

let mockQueryState: {
  data: typeof mockConnections | undefined;
  isLoading: boolean;
  isError: boolean;
};

vi.mock("@/modules/integrations/presentation/hooks/use-integrations", () => ({
  useIntegrations: () => mockQueryState,
  useDeleteIntegration: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
  useTestIntegration: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
  useTriggerSync: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
}));

import { IntegrationList } from "@/modules/integrations/presentation/components/integration-list";

describe("IntegrationList", () => {
  beforeEach(() => {
    mockQueryState = {
      data: mockConnections,
      isLoading: false,
      isError: false,
    };
  });

  it("Given: loading state When: rendering Then: should show skeletons", () => {
    mockQueryState = {
      data: undefined,
      isLoading: true,
      isError: false,
    };

    render(<IntegrationList />);

    expect(screen.queryByText("My VTEX Store")).not.toBeInTheDocument();
  });

  it("Given: error state When: rendering Then: should show error message", () => {
    mockQueryState = {
      data: undefined,
      isLoading: false,
      isError: true,
    };

    render(<IntegrationList />);

    expect(screen.getByText("error.loading")).toBeInTheDocument();
  });

  it("Given: empty connections When: rendering Then: should show empty state", () => {
    mockQueryState = {
      data: [],
      isLoading: false,
      isError: false,
    };

    render(<IntegrationList />);

    expect(screen.getByText("list.empty")).toBeInTheDocument();
    expect(screen.getByText("list.emptyDescription")).toBeInTheDocument();
  });

  it("Given: no connections (undefined) When: rendering Then: should show empty state", () => {
    mockQueryState = {
      data: undefined,
      isLoading: false,
      isError: false,
    };

    render(<IntegrationList />);

    expect(screen.getByText("list.empty")).toBeInTheDocument();
  });

  it("Given: connections data When: rendering Then: should show connection store names", () => {
    render(<IntegrationList />);

    expect(screen.getByText("My VTEX Store")).toBeInTheDocument();
    expect(screen.getByText("Other Store")).toBeInTheDocument();
  });

  it("Given: connections data When: rendering Then: should show provider and account name", () => {
    render(<IntegrationList />);

    expect(screen.getByText(/myaccount/)).toBeInTheDocument();
    expect(screen.getByText(/otheraccount/)).toBeInTheDocument();
  });
});
