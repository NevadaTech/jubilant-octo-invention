import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

let mockMultiCompanyEnabled = false;

vi.mock("@/shared/presentation/hooks/use-org-settings", () => ({
  useOrgSettings: () => ({ multiCompanyEnabled: mockMultiCompanyEnabled }),
}));

vi.mock("@/modules/inventory/presentation/hooks/use-warehouses", () => ({
  useWarehouses: () => ({
    data: { data: [{ id: "wh-1", name: "Main Warehouse" }] },
  }),
}));

vi.mock("@/modules/contacts/presentation/hooks/use-contacts", () => ({
  useContacts: () => ({
    data: { data: [{ id: "ct-1", name: "Default Contact" }] },
  }),
}));

vi.mock("@/modules/companies/presentation/hooks/use-companies", () => ({
  useCompanies: () => ({
    data: { data: [{ id: "co-1", name: "Main Company" }] },
  }),
}));

vi.mock("@/modules/integrations/presentation/hooks/use-integrations", () => ({
  useCreateIntegration: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
  useUpdateIntegration: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
  useTriggerSync: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
}));

import { VtexConnectionForm } from "@/modules/integrations/presentation/components/vtex-connection-form";

describe("VtexConnectionForm", () => {
  const mockConnection = {
    id: "conn-1",
    provider: "VTEX" as const,
    accountName: "mystore",
    storeName: "My Store",
    status: "CONNECTED" as const,
    syncStrategy: "BOTH" as const,
    syncDirection: "BIDIRECTIONAL" as const,
    defaultWarehouseId: "wh-1",
    warehouseName: "Main Warehouse",
    defaultContactId: null,
    defaultContactName: null,
    companyId: null,
    companyName: null,
    connectedAt: new Date(),
    lastSyncAt: null,
    lastSyncError: null,
    syncedOrdersCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    isConnected: true,
    hasError: false,
  };

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    mode: "create" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockMultiCompanyEnabled = false;
  });

  it("Given: create mode When: rendering Then: should show create title", () => {
    render(<VtexConnectionForm {...defaultProps} />);

    expect(screen.getByText("form.createTitle")).toBeInTheDocument();
  });

  it("Given: edit mode When: rendering Then: should show edit title", () => {
    render(
      <VtexConnectionForm
        {...defaultProps}
        mode="edit"
        connection={mockConnection as never}
      />,
    );

    expect(screen.getByText("form.editTitle")).toBeInTheDocument();
  });

  it("Given: create mode When: rendering Then: should show accountName field", () => {
    render(<VtexConnectionForm {...defaultProps} />);

    expect(screen.getByText("form.accountName *")).toBeInTheDocument();
  });

  it("Given: edit mode When: rendering Then: should hide accountName field", () => {
    render(
      <VtexConnectionForm
        {...defaultProps}
        mode="edit"
        connection={mockConnection as never}
      />,
    );

    expect(screen.queryByText("form.accountName *")).not.toBeInTheDocument();
  });

  it("Given: create mode When: rendering Then: should show storeName field", () => {
    render(<VtexConnectionForm {...defaultProps} />);

    expect(screen.getByText("form.storeName *")).toBeInTheDocument();
  });

  it("Given: create mode When: rendering Then: should show connect button", () => {
    render(<VtexConnectionForm {...defaultProps} />);

    expect(screen.getByText("actions.connect")).toBeInTheDocument();
  });

  it("Given: edit mode When: rendering Then: should show save button", () => {
    render(
      <VtexConnectionForm
        {...defaultProps}
        mode="edit"
        connection={mockConnection as never}
      />,
    );

    expect(screen.getByText("save")).toBeInTheDocument();
  });

  it("Given: multiCompanyEnabled false When: rendering Then: should not show company field", () => {
    mockMultiCompanyEnabled = false;

    render(<VtexConnectionForm {...defaultProps} />);

    expect(screen.queryByText("form.company")).not.toBeInTheDocument();
  });

  it("Given: multiCompanyEnabled true When: rendering Then: should show company field", () => {
    mockMultiCompanyEnabled = true;

    render(<VtexConnectionForm {...defaultProps} />);

    expect(screen.getByText("form.company")).toBeInTheDocument();
  });

  it("Given: form When: rendering Then: should show cancel button", () => {
    render(<VtexConnectionForm {...defaultProps} />);

    expect(screen.getByText("cancel")).toBeInTheDocument();
  });

  it("Given: closed dialog When: rendering Then: should not be visible", () => {
    render(<VtexConnectionForm {...defaultProps} open={false} />);

    expect(screen.queryByText("form.createTitle")).not.toBeInTheDocument();
  });
});
