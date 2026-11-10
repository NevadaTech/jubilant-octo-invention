import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TransferFormPage } from "@/modules/inventory/presentation/components/transfers/transfer-form-page";
import { toCreateTransferDto } from "@/modules/inventory/presentation/schemas/transfer.schema";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

const mockPush = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/modules/inventory/presentation/hooks/use-transfers", () => ({
  useCreateTransfer: () => ({
    isPending: false,
    isError: false,
    mutateAsync: vi.fn().mockResolvedValue({ id: "xfer-1" }),
  }),
}));

let lastUseProductsArgs: Record<string, unknown> | undefined;

vi.mock("@/modules/inventory/presentation/hooks/use-products", () => ({
  useProducts: (args?: Record<string, unknown>) => {
    lastUseProductsArgs = args;
    return {
      data: {
        data: [
          { id: "p1", name: "Widget A", sku: "WA-001" },
          { id: "p2", name: "Widget B", sku: "WB-002" },
        ],
      },
    };
  },
}));

vi.mock("@/modules/inventory/presentation/hooks/use-warehouses", () => ({
  useWarehouses: () => ({
    data: {
      data: [
        { id: "wh-1", name: "Main Warehouse", code: "MW" },
        { id: "wh-2", name: "Secondary Warehouse", code: "SW" },
      ],
    },
  }),
}));

vi.mock("@/modules/inventory/presentation/schemas/transfer.schema", () => ({
  createTransferSchema: { parse: vi.fn() },
  toCreateTransferDto: vi.fn((d: unknown, companyId: string) => ({
    ...(d as object),
    companyId,
  })),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => async (values: unknown) => ({
    values,
    errors: {},
  }),
}));

let mockSelectedCompanyId: string | null = "company-test-1";

vi.mock("@/modules/companies/presentation/hooks/use-companies", () => ({
  useCompanies: () => ({ data: { data: [] }, isLoading: false }),
}));

vi.mock("@/modules/companies/infrastructure/store/company.store", () => ({
  useCompanyStore: (
    selector: (state: {
      selectedCompanyId: string | null;
      setSelectedCompany: (id: string | null) => void;
    }) => unknown,
  ) =>
    selector({
      selectedCompanyId: mockSelectedCompanyId,
      setSelectedCompany: vi.fn(),
    }),
}));

// --- Tests ---

describe("TransferFormPage", () => {
  beforeEach(() => {
    mockSelectedCompanyId = "company-test-1";
    lastUseProductsArgs = undefined;
    vi.mocked(toCreateTransferDto).mockClear();
  });

  it("Given: component renders When: rendering Then: should show create title and description", () => {
    render(<TransferFormPage />);

    expect(screen.getByText("form.createTitle")).toBeInTheDocument();
    expect(screen.getByText("form.createDescription")).toBeInTheDocument();
  });

  it("Given: component renders When: rendering Then: should show transfer info card title", () => {
    render(<TransferFormPage />);

    expect(screen.getByText("form.transferInfo")).toBeInTheDocument();
  });

  it("Given: component renders When: rendering Then: should show from and to warehouse fields", () => {
    render(<TransferFormPage />);

    expect(
      screen.getByText(
        (content) =>
          content.startsWith("fields.from") && !content.includes("Placeholder"),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        (content) =>
          content.startsWith("fields.to") && !content.includes("Placeholder"),
      ),
    ).toBeInTheDocument();
  });

  it("Given: component renders When: rendering Then: should show products label and add product button", () => {
    render(<TransferFormPage />);

    expect(screen.getByText(/fields\.products/)).toBeInTheDocument();
    expect(screen.getByText("actions.addProduct")).toBeInTheDocument();
  });

  it("Given: component renders When: rendering Then: should show notes field", () => {
    render(<TransferFormPage />);

    expect(screen.getByText("fields.notes")).toBeInTheDocument();
  });

  it("Given: component renders When: rendering Then: should show cancel and create buttons", () => {
    render(<TransferFormPage />);

    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("create")).toBeInTheDocument();
  });

  it("Given: component renders When: rendering Then: should render back link to transfers list", () => {
    render(<TransferFormPage />);

    const links = screen.getAllByRole("link");
    const backLink = links.find(
      (link) => link.getAttribute("href") === "/dashboard/inventory/transfers",
    );
    expect(backLink).toBeDefined();
  });

  it("Given: component renders When: rendering Then: should render one product line by default", () => {
    const { container } = render(<TransferFormPage />);

    // At least one line should be rendered with a quantity input
    const numberInputs = container.querySelectorAll('input[type="number"]');
    expect(numberInputs.length).toBeGreaterThanOrEqual(1);
  });

  it("Given: selectedCompanyId is null When: opening create Then: guard blocks submit with required-company copy", () => {
    mockSelectedCompanyId = null;
    render(<TransferFormPage />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("requiredCompany.title")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "create" })).toBeDisabled();
  });

  it("Given: non-null selectedCompanyId When: submitting create Then: toCreateTransferDto receives that companyId", async () => {
    mockSelectedCompanyId = "xfer-company-7";
    const { container } = render(<TransferFormPage />);

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(toCreateTransferDto).toHaveBeenCalledWith(
        expect.anything(),
        "xfer-company-7",
      );
    });
  });

  it("Given: non-null selectedCompanyId When: rendering inventory product picker Then: useProducts omits ownership companyId", () => {
    mockSelectedCompanyId = "xfer-company-shared";
    render(<TransferFormPage />);

    expect(lastUseProductsArgs).toBeDefined();
    expect(lastUseProductsArgs).not.toHaveProperty("companyId");
    expect(lastUseProductsArgs?.statuses).toEqual(["ACTIVE"]);
  });
});
