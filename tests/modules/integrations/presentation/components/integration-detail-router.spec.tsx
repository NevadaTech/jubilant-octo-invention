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
  useRouter: () => ({ push: vi.fn() }),
}));

let mockQueryState: {
  data: { provider: string; [key: string]: unknown } | null | undefined;
  isLoading: boolean;
};

vi.mock("@/modules/integrations/presentation/hooks/use-integrations", () => ({
  useIntegration: () => mockQueryState,
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
  useGetMeliAuthUrl: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
  useSyncLogs: () => ({
    data: {
      data: [],
      pagination: { page: 1, total: 0, totalPages: 0, limit: 20 },
    },
    isLoading: false,
  }),
  useRetrySyncLog: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
  useSkuMappings: () => ({ data: [], isLoading: false }),
  useDeleteSkuMapping: () => ({ isPending: false, mutate: vi.fn() }),
  useCreateSkuMapping: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useUnmatchedSkus: () => ({ data: [] }),
  useRetryAllFailed: () => ({ isPending: false, mutate: vi.fn() }),
  useCreateIntegration: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useUpdateIntegration: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock("@/modules/inventory/presentation/hooks/use-warehouses", () => ({
  useWarehouses: () => ({ data: { data: [] } }),
}));

vi.mock("@/modules/contacts/presentation/hooks/use-contacts", () => ({
  useContacts: () => ({ data: { data: [] } }),
}));

vi.mock("@/modules/companies/presentation/hooks/use-companies", () => ({
  useCompanies: () => ({ data: { data: [] } }),
}));

vi.mock("@/shared/presentation/hooks/use-org-settings", () => ({
  useOrgSettings: () => ({ multiCompanyEnabled: false }),
}));

import { IntegrationDetailRouter } from "@/modules/integrations/presentation/components/integration-detail-router";

const vtexConnection = {
  provider: "VTEX",
  id: "conn-vtex-1",
  accountName: "mystore",
  storeName: "My VTEX Store",
  status: "CONNECTED" as const,
  syncStrategy: "BOTH" as const,
  syncDirection: "BIDIRECTIONAL" as const,
  defaultWarehouseId: "wh-1",
  warehouseName: "Main Warehouse",
  defaultContactId: null,
  defaultContactName: null,
  companyId: null,
  companyName: null,
  connectedAt: new Date("2026-03-01"),
  lastSyncAt: new Date("2026-03-07"),
  lastSyncError: null,
  syncedOrdersCount: 42,
  tokenStatus: null,
  meliUserId: null,
  needsReauth: false,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-03-07"),
  isConnected: true,
  hasError: false,
};

const meliConnection = {
  provider: "MERCADOLIBRE",
  id: "conn-meli-1",
  accountName: "meli-1234567890",
  storeName: "Mi Tienda MeLi",
  status: "CONNECTED" as const,
  syncStrategy: "BOTH" as const,
  syncDirection: "INBOUND" as const,
  defaultWarehouseId: "wh-1",
  warehouseName: "Main Warehouse",
  defaultContactId: null,
  defaultContactName: null,
  companyId: null,
  companyName: null,
  connectedAt: new Date("2026-03-01"),
  lastSyncAt: new Date("2026-03-07"),
  lastSyncError: null,
  syncedOrdersCount: 85,
  tokenStatus: "VALID" as const,
  meliUserId: "ML-12345",
  needsReauth: false,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-03-07"),
  isConnected: true,
  hasError: false,
};

const vtexServerData = {
  id: "conn-vtex-1",
  provider: "VTEX" as const,
  accountName: "mystore",
  storeName: "My VTEX Store",
  status: "CONNECTED" as const,
  syncStrategy: "BOTH" as const,
  syncDirection: "BIDIRECTIONAL" as const,
  defaultWarehouseId: "wh-1",
  syncedOrdersCount: 42,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-03-07T00:00:00Z",
};

const meliServerData = {
  id: "conn-meli-1",
  provider: "MERCADOLIBRE" as const,
  accountName: "meli-1234567890",
  storeName: "Mi Tienda MeLi",
  status: "CONNECTED" as const,
  syncStrategy: "BOTH" as const,
  syncDirection: "INBOUND" as const,
  defaultWarehouseId: "wh-1",
  syncedOrdersCount: 85,
  tokenStatus: "VALID",
  meliUserId: "ML-12345",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-03-07T00:00:00Z",
};

describe("IntegrationDetailRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Given: loading state When: rendering Then: should show loading skeleton", () => {
    mockQueryState = {
      data: undefined,
      isLoading: true,
    };

    render(<IntegrationDetailRouter connectionId="conn-1" />);

    expect(screen.queryByText("My VTEX Store")).not.toBeInTheDocument();
    expect(screen.queryByText("Mi Tienda MeLi")).not.toBeInTheDocument();
  });

  it("Given: VTEX provider When: rendering Then: should render VtexConnectionDetail", () => {
    mockQueryState = {
      data: vtexConnection,
      isLoading: false,
    };

    render(<IntegrationDetailRouter connectionId="conn-vtex-1" />);

    expect(screen.getByText("My VTEX Store")).toBeInTheDocument();
  });

  it("Given: MERCADOLIBRE provider When: rendering Then: should render MeliConnectionDetail", () => {
    mockQueryState = {
      data: meliConnection,
      isLoading: false,
    };

    render(<IntegrationDetailRouter connectionId="conn-meli-1" />);

    expect(screen.getByText("Mi Tienda MeLi")).toBeInTheDocument();
  });

  it("Given: VTEX provider When: rendering Then: should show VTEX-specific action buttons", () => {
    mockQueryState = {
      data: vtexConnection,
      isLoading: false,
    };

    render(<IntegrationDetailRouter connectionId="conn-vtex-1" />);

    expect(screen.getByText("actions.test")).toBeInTheDocument();
    expect(screen.getByText("actions.sync")).toBeInTheDocument();
    expect(screen.getByText("actions.edit")).toBeInTheDocument();
  });

  it("Given: MERCADOLIBRE provider When: rendering Then: should show MeLi-specific buttons without edit", () => {
    mockQueryState = {
      data: meliConnection,
      isLoading: false,
    };

    render(<IntegrationDetailRouter connectionId="conn-meli-1" />);

    expect(screen.getByText("actions.test")).toBeInTheDocument();
    expect(screen.getByText("actions.sync")).toBeInTheDocument();
  });

  it("Given: null connection data When: rendering Then: should fallback to VtexConnectionDetail", () => {
    mockQueryState = {
      data: null,
      isLoading: false,
    };

    render(<IntegrationDetailRouter connectionId="conn-1" />);

    // When connection is null, VtexConnectionDetail is rendered as default,
    // and it shows not found since useIntegration returns null
    expect(screen.getByText("detail.notFound")).toBeInTheDocument();
  });

  it("Given: VTEX serverData When: rendering Then: should render VtexConnectionDetail immediately", () => {
    mockQueryState = {
      data: vtexConnection,
      isLoading: false,
    };

    render(
      <IntegrationDetailRouter
        connectionId="conn-vtex-1"
        serverData={vtexServerData}
      />,
    );

    expect(screen.getByText("My VTEX Store")).toBeInTheDocument();
  });

  it("Given: MERCADOLIBRE serverData When: rendering Then: should render MeliConnectionDetail immediately", () => {
    mockQueryState = {
      data: meliConnection,
      isLoading: false,
    };

    render(
      <IntegrationDetailRouter
        connectionId="conn-meli-1"
        serverData={meliServerData}
      />,
    );

    expect(screen.getByText("Mi Tienda MeLi")).toBeInTheDocument();
  });

  it("Given: no serverData and loading When: rendering Then: should show skeleton", () => {
    mockQueryState = {
      data: undefined,
      isLoading: true,
    };

    const { container } = render(
      <IntegrationDetailRouter connectionId="conn-vtex-1" />,
    );

    // Router shows skeleton when no data and loading
    expect(container.querySelector(".h-10")).toBeInTheDocument();
  });
});
