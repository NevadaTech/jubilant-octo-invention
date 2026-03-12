import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
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

const mockMutateAsync = vi.fn().mockResolvedValue({});

vi.mock("@/modules/integrations/presentation/hooks/use-integrations", () => ({
  useCreateIntegration: () => ({
    isPending: false,
    mutateAsync: mockMutateAsync,
  }),
}));

import { MeliConnectionForm } from "@/modules/integrations/presentation/components/meli-connection-form";

describe("MeliConnectionForm", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockMultiCompanyEnabled = false;
  });

  it("Given: open dialog When: rendering Then: should show the MeLi form title", () => {
    render(<MeliConnectionForm {...defaultProps} />);

    expect(
      screen.getByText("providers.mercadolibre.addConnection"),
    ).toBeInTheDocument();
  });

  it("Given: open dialog When: rendering Then: should show form description", () => {
    render(<MeliConnectionForm {...defaultProps} />);

    expect(
      screen.getByText("providers.mercadolibre.formDescription"),
    ).toBeInTheDocument();
  });

  it("Given: open dialog When: rendering Then: should show storeName field", () => {
    render(<MeliConnectionForm {...defaultProps} />);

    expect(screen.getByText("form.storeName *")).toBeInTheDocument();
  });

  it("Given: open dialog When: rendering Then: should show clientId field", () => {
    render(<MeliConnectionForm {...defaultProps} />);

    expect(
      screen.getByText("providers.mercadolibre.form.clientId *"),
    ).toBeInTheDocument();
  });

  it("Given: open dialog When: rendering Then: should show clientSecret field", () => {
    render(<MeliConnectionForm {...defaultProps} />);

    expect(
      screen.getByText("providers.mercadolibre.form.clientSecret *"),
    ).toBeInTheDocument();
  });

  it("Given: open dialog When: rendering Then: should show syncStrategy field", () => {
    render(<MeliConnectionForm {...defaultProps} />);

    expect(screen.getByText("form.syncStrategy *")).toBeInTheDocument();
  });

  it("Given: open dialog When: rendering Then: should show warehouse field", () => {
    render(<MeliConnectionForm {...defaultProps} />);

    expect(screen.getByText("form.warehouse *")).toBeInTheDocument();
  });

  it("Given: open dialog When: rendering Then: should show syncDirection locked to INBOUND and disabled", () => {
    render(<MeliConnectionForm {...defaultProps} />);

    expect(screen.getByText("form.syncDirection")).toBeInTheDocument();
    const inboundInput = screen.getByDisplayValue("syncDirection.inbound");
    expect(inboundInput).toBeDisabled();
  });

  it("Given: open dialog When: rendering Then: should show inbound-only explanation", () => {
    render(<MeliConnectionForm {...defaultProps} />);

    expect(
      screen.getByText("providers.mercadolibre.inboundOnly"),
    ).toBeInTheDocument();
  });

  it("Given: open dialog When: rendering Then: should show save button", () => {
    render(<MeliConnectionForm {...defaultProps} />);

    expect(screen.getByText("save")).toBeInTheDocument();
  });

  it("Given: open dialog When: rendering Then: should show cancel button", () => {
    render(<MeliConnectionForm {...defaultProps} />);

    expect(screen.getByText("cancel")).toBeInTheDocument();
  });

  it("Given: multiCompanyEnabled false When: rendering Then: should not show company field", () => {
    mockMultiCompanyEnabled = false;

    render(<MeliConnectionForm {...defaultProps} />);

    expect(screen.queryByText("form.company")).not.toBeInTheDocument();
  });

  it("Given: multiCompanyEnabled true When: rendering Then: should show company field", () => {
    mockMultiCompanyEnabled = true;

    render(<MeliConnectionForm {...defaultProps} />);

    expect(screen.getByText("form.company")).toBeInTheDocument();
  });

  it("Given: closed dialog When: rendering Then: should not show form content", () => {
    render(<MeliConnectionForm {...defaultProps} open={false} />);

    expect(
      screen.queryByText("providers.mercadolibre.addConnection"),
    ).not.toBeInTheDocument();
  });

  it("Given: cancel button When: clicking Then: should call onOpenChange(false)", () => {
    render(<MeliConnectionForm {...defaultProps} />);

    fireEvent.click(screen.getByText("cancel"));

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Given: open dialog When: rendering Then: should show default contact field", () => {
    render(<MeliConnectionForm {...defaultProps} />);

    expect(screen.getByText("form.defaultContact")).toBeInTheDocument();
  });
});
