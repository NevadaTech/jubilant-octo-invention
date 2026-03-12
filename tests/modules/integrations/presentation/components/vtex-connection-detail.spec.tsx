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

const mockConnection = {
  id: "conn-1",
  provider: "VTEX",
  accountName: "mystore",
  storeName: "My VTEX Store",
  status: "CONNECTED" as const,
  syncStrategy: "BOTH" as const,
  syncDirection: "BIDIRECTIONAL" as const,
  defaultWarehouseId: "wh-1",
  warehouseName: "Main Warehouse",
  defaultContactId: "ct-1",
  defaultContactName: "Default Contact",
  companyId: "co-1",
  companyName: "Main Company",
  connectedAt: new Date("2026-03-01T10:00:00.000Z"),
  lastSyncAt: new Date("2026-03-07T10:00:00.000Z"),
  lastSyncError: null,
  syncedOrdersCount: 42,
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

import { VtexConnectionDetail } from "@/modules/integrations/presentation/components/vtex-connection-detail";

describe("VtexConnectionDetail", () => {
  beforeEach(() => {
    mockQueryState = {
      data: mockConnection,
      isLoading: false,
      isError: false,
    };
  });

  it("Given: connection data When: rendering Then: should show store name", () => {
    render(<VtexConnectionDetail connectionId="conn-1" />);

    expect(screen.getByText("My VTEX Store")).toBeInTheDocument();
  });

  it("Given: connection data When: rendering Then: should show account name", () => {
    render(<VtexConnectionDetail connectionId="conn-1" />);

    expect(screen.getByText(/mystore/)).toBeInTheDocument();
  });

  it("Given: connection data When: rendering Then: should show action buttons", () => {
    render(<VtexConnectionDetail connectionId="conn-1" />);

    expect(screen.getByText("actions.test")).toBeInTheDocument();
    expect(screen.getByText("actions.sync")).toBeInTheDocument();
    expect(screen.getByText("actions.edit")).toBeInTheDocument();
  });

  it("Given: connection with companyName When: rendering Then: should show company", () => {
    render(<VtexConnectionDetail connectionId="conn-1" />);

    expect(screen.getByText("Main Company")).toBeInTheDocument();
  });

  it("Given: connection with defaultContactName When: rendering Then: should show contact", () => {
    render(<VtexConnectionDetail connectionId="conn-1" />);

    expect(screen.getByText("Default Contact")).toBeInTheDocument();
  });

  it("Given: connection with lastSyncError When: rendering Then: should show error", () => {
    mockQueryState = {
      data: { ...mockConnection, lastSyncError: "Sync failed" },
      isLoading: false,
      isError: false,
    };

    render(<VtexConnectionDetail connectionId="conn-1" />);

    expect(screen.getByText("Sync failed")).toBeInTheDocument();
  });

  it("Given: connection without lastSyncError When: rendering Then: should not show error section", () => {
    render(<VtexConnectionDetail connectionId="conn-1" />);

    expect(screen.queryByText("fields.lastError")).not.toBeInTheDocument();
  });

  it("Given: loading state When: rendering Then: should show skeletons", () => {
    mockQueryState = {
      data: undefined,
      isLoading: true,
      isError: false,
    };

    render(<VtexConnectionDetail connectionId="conn-1" />);

    expect(screen.queryByText("My VTEX Store")).not.toBeInTheDocument();
  });

  it("Given: error state When: rendering Then: should show not found", () => {
    mockQueryState = {
      data: undefined,
      isLoading: false,
      isError: true,
    };

    render(<VtexConnectionDetail connectionId="conn-1" />);

    expect(screen.getByText("detail.notFound")).toBeInTheDocument();
  });

  it("Given: null connection When: rendering Then: should show not found", () => {
    mockQueryState = {
      data: null,
      isLoading: false,
      isError: false,
    };

    render(<VtexConnectionDetail connectionId="conn-1" />);

    expect(screen.getByText("detail.notFound")).toBeInTheDocument();
  });

  it("Given: connection without companyName When: rendering Then: should not show company field", () => {
    mockQueryState = {
      data: { ...mockConnection, companyName: null },
      isLoading: false,
      isError: false,
    };

    render(<VtexConnectionDetail connectionId="conn-1" />);

    const companyLabels = screen.queryAllByText("form.company");
    expect(companyLabels).toHaveLength(0);
  });

  it("Given: connection without defaultContactName When: rendering Then: should not show contact field", () => {
    mockQueryState = {
      data: { ...mockConnection, defaultContactName: null },
      isLoading: false,
      isError: false,
    };

    render(<VtexConnectionDetail connectionId="conn-1" />);

    const contactLabels = screen.queryAllByText("form.defaultContact");
    expect(contactLabels).toHaveLength(0);
  });
});
