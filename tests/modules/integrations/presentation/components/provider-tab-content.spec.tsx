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
}));

const mockConnections = [
  {
    id: "conn-1",
    storeName: "Store Alpha",
    accountName: "alpha",
    provider: "VTEX",
    status: "CONNECTED",
    isConnected: true,
    hasError: false,
    syncedOrdersCount: 10,
    lastSyncAt: new Date("2026-03-07"),
    lastSyncError: null,
    companyName: null,
  },
];

let mockQueryState: {
  data: typeof mockConnections | undefined;
  isLoading: boolean;
  isError: boolean;
};

vi.mock("@/modules/integrations/presentation/hooks/use-integrations", () => ({
  useIntegrations: () => mockQueryState,
  useDeleteIntegration: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useTestIntegration: () => ({ isPending: false, mutate: vi.fn() }),
  useTriggerSync: () => ({ isPending: false, mutate: vi.fn() }),
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

import { ProviderTabContent } from "@/modules/integrations/presentation/components/provider-tab-content";

describe("ProviderTabContent", () => {
  beforeEach(() => {
    mockQueryState = {
      data: mockConnections,
      isLoading: false,
      isError: false,
    };
  });

  it("Given: connections data When: rendering Then: should show provider header", () => {
    render(<ProviderTabContent provider="VTEX" />);

    expect(screen.getByText("providers.vtex.name")).toBeInTheDocument();
  });

  it("Given: connections data When: rendering Then: should show connection cards", () => {
    render(<ProviderTabContent provider="VTEX" />);

    expect(screen.getByText("Store Alpha")).toBeInTheDocument();
  });

  it("Given: empty connections When: rendering Then: should show empty state", () => {
    mockQueryState = {
      data: [],
      isLoading: false,
      isError: false,
    };

    render(<ProviderTabContent provider="VTEX" />);

    expect(screen.getByText("list.empty")).toBeInTheDocument();
  });

  it("Given: loading state When: rendering Then: should show skeletons", () => {
    mockQueryState = {
      data: undefined,
      isLoading: true,
      isError: false,
    };

    render(<ProviderTabContent provider="VTEX" />);

    expect(screen.queryByText("Store Alpha")).not.toBeInTheDocument();
  });

  it("Given: error state When: rendering Then: should show error message", () => {
    mockQueryState = {
      data: undefined,
      isLoading: false,
      isError: true,
    };

    render(<ProviderTabContent provider="VTEX" />);

    expect(screen.getByText("error.loading")).toBeInTheDocument();
  });

  it("Given: null connections When: rendering Then: should show empty state", () => {
    mockQueryState = {
      data: undefined,
      isLoading: false,
      isError: false,
    };

    render(<ProviderTabContent provider="VTEX" />);

    expect(screen.getByText("list.empty")).toBeInTheDocument();
  });
});
