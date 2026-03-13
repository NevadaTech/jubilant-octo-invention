import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

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

const mockConnection = {
  id: "conn-meli-1",
  provider: "MERCADOLIBRE",
  accountName: "meli-1709834000",
  storeName: "Mi Tienda MeLi",
  status: "CONNECTED" as const,
  syncStrategy: "BOTH" as const,
  syncDirection: "INBOUND" as const,
  defaultWarehouseId: "wh-1",
  warehouseName: "Main Warehouse",
  defaultContactId: "ct-1",
  defaultContactName: "Default Contact",
  companyId: "co-1",
  companyName: "Main Company",
  connectedAt: new Date("2026-03-01T10:00:00.000Z"),
  lastSyncAt: new Date("2026-03-07T10:00:00.000Z"),
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

let mockQueryState: {
  data: typeof mockConnection | null | undefined;
  isLoading: boolean;
  isError: boolean;
};

const mockTestMutate = vi.fn();
const mockSyncMutate = vi.fn();
const mockGetMeliAuthUrlMutateAsync = vi.fn().mockResolvedValue({
  data: { authUrl: "https://auth.mercadolibre.com/authorize?state=xxx" },
});

vi.mock("@/modules/integrations/presentation/hooks/use-integrations", () => ({
  useIntegration: () => mockQueryState,
  useDeleteIntegration: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
  useTestIntegration: () => ({
    isPending: false,
    mutate: mockTestMutate,
  }),
  useTriggerSync: () => ({
    isPending: false,
    mutate: mockSyncMutate,
  }),
  useGetMeliAuthUrl: () => ({
    isPending: false,
    mutateAsync: mockGetMeliAuthUrlMutateAsync,
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

import { MeliConnectionDetail } from "@/modules/integrations/presentation/components/meli-connection-detail";

describe("MeliConnectionDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryState = {
      data: mockConnection,
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

    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    expect(screen.queryByText("Mi Tienda MeLi")).not.toBeInTheDocument();
  });

  it("Given: error state When: rendering Then: should show not found", () => {
    mockQueryState = {
      data: undefined,
      isLoading: false,
      isError: true,
    };

    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    expect(screen.getByText("detail.notFound")).toBeInTheDocument();
  });

  it("Given: null connection When: rendering Then: should show not found", () => {
    mockQueryState = {
      data: null,
      isLoading: false,
      isError: false,
    };

    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    expect(screen.getByText("detail.notFound")).toBeInTheDocument();
  });

  it("Given: connection data When: rendering Then: should show store name", () => {
    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    expect(screen.getByText("Mi Tienda MeLi")).toBeInTheDocument();
  });

  it("Given: connection data When: rendering Then: should show account name in header", () => {
    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    expect(screen.getByText(/meli-1709834000/)).toBeInTheDocument();
  });

  it("Given: connection with tokenStatus VALID When: rendering Then: should show token status badge", () => {
    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    expect(
      screen.getByText("providers.mercadolibre.tokenStatus.VALID"),
    ).toBeInTheDocument();
  });

  it("Given: connection with tokenStatus EXPIRED When: rendering Then: should show expired badge", () => {
    mockQueryState = {
      data: { ...mockConnection, tokenStatus: "EXPIRED" as const },
      isLoading: false,
      isError: false,
    };

    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    expect(
      screen.getByText("providers.mercadolibre.tokenStatus.EXPIRED"),
    ).toBeInTheDocument();
  });

  it("Given: connection with needsReauth true When: rendering Then: should show re-auth banner", () => {
    mockQueryState = {
      data: {
        ...mockConnection,
        needsReauth: true,
        tokenStatus: "REAUTH_REQUIRED" as const,
      },
      isLoading: false,
      isError: false,
    };

    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    expect(
      screen.getByText("providers.mercadolibre.reauthRequired"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("providers.mercadolibre.reauthDescription"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("providers.mercadolibre.reauthAction"),
    ).toBeInTheDocument();
  });

  it("Given: connection with needsReauth false When: rendering Then: should hide re-auth banner", () => {
    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    expect(
      screen.queryByText("providers.mercadolibre.reauthRequired"),
    ).not.toBeInTheDocument();
  });

  it("Given: connection with needsReauth true When: clicking re-auth button Then: should call getMeliAuthUrl", () => {
    mockQueryState = {
      data: {
        ...mockConnection,
        needsReauth: true,
        tokenStatus: "REAUTH_REQUIRED" as const,
      },
      isLoading: false,
      isError: false,
    };

    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    fireEvent.click(screen.getByText("providers.mercadolibre.reauthAction"));

    expect(mockGetMeliAuthUrlMutateAsync).toHaveBeenCalledWith({
      connectionId: "conn-meli-1",
      redirectUri: expect.any(String),
    });
  });

  it("Given: DISCONNECTED connection without needsReauth When: rendering Then: should show connect button", () => {
    mockQueryState = {
      data: {
        ...mockConnection,
        status: "DISCONNECTED" as const,
        isConnected: false,
        needsReauth: false,
      },
      isLoading: false,
      isError: false,
    };

    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    expect(
      screen.getByText("providers.mercadolibre.connectButton"),
    ).toBeInTheDocument();
  });

  it("Given: CONNECTED connection When: rendering Then: should not show connect button", () => {
    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    expect(
      screen.queryByText("providers.mercadolibre.connectButton"),
    ).not.toBeInTheDocument();
  });

  it("Given: connection data When: rendering Then: should show test button", () => {
    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    expect(screen.getByText("actions.test")).toBeInTheDocument();
  });

  it("Given: connection data When: rendering Then: should show sync button", () => {
    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    expect(screen.getByText("actions.sync")).toBeInTheDocument();
  });

  it("Given: connection data When: clicking test button Then: should call testIntegration", () => {
    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    fireEvent.click(screen.getByText("actions.test"));

    expect(mockTestMutate).toHaveBeenCalledWith("conn-meli-1");
  });

  it("Given: connection data When: clicking sync button Then: should call triggerSync", () => {
    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    fireEvent.click(screen.getByText("actions.sync"));

    expect(mockSyncMutate).toHaveBeenCalledWith({ id: "conn-meli-1" });
  });

  it("Given: connection with companyName When: rendering Then: should show company", () => {
    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    expect(screen.getByText("Main Company")).toBeInTheDocument();
  });

  it("Given: connection with defaultContactName When: rendering Then: should show contact", () => {
    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    expect(screen.getByText("Default Contact")).toBeInTheDocument();
  });

  it("Given: connection with lastSyncError When: rendering Then: should show error", () => {
    mockQueryState = {
      data: { ...mockConnection, lastSyncError: "OAuth token expired" },
      isLoading: false,
      isError: false,
    };

    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    expect(screen.getByText("OAuth token expired")).toBeInTheDocument();
  });

  it("Given: connection without lastSyncError When: rendering Then: should not show error section", () => {
    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    expect(screen.queryByText("fields.lastError")).not.toBeInTheDocument();
  });

  it("Given: connection without companyName When: rendering Then: should not show company field", () => {
    mockQueryState = {
      data: { ...mockConnection, companyName: null },
      isLoading: false,
      isError: false,
    };

    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    const companyLabels = screen.queryAllByText("form.company");
    expect(companyLabels).toHaveLength(0);
  });

  it("Given: connection without defaultContactName When: rendering Then: should not show contact field", () => {
    mockQueryState = {
      data: { ...mockConnection, defaultContactName: null },
      isLoading: false,
      isError: false,
    };

    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    const contactLabels = screen.queryAllByText("form.defaultContact");
    expect(contactLabels).toHaveLength(0);
  });

  it("Given: connection data When: rendering Then: should show dropdown menu with delete action", () => {
    const { container } = render(
      <MeliConnectionDetail connectionId="conn-meli-1" />,
    );

    // Delete is inside a dropdown menu — verify the trigger exists
    const menuTrigger = container.querySelector('[aria-haspopup="menu"]');
    expect(menuTrigger).toBeInTheDocument();
  });

  it("Given: connection data When: rendering Then: should show sync log tabs", () => {
    render(<MeliConnectionDetail connectionId="conn-meli-1" />);

    expect(screen.getByText("syncLogs.title")).toBeInTheDocument();
    expect(screen.getByText("skuMapping.title")).toBeInTheDocument();
  });
});
