import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SaleFormPage } from "@/modules/sales/presentation/components/sale-form-page";

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

vi.mock("@/modules/sales/presentation/hooks/use-sales", () => ({
  useCreateSale: () => ({
    isPending: false,
    isError: false,
    mutateAsync: vi.fn(),
  }),
}));

vi.mock("@/modules/inventory/presentation/hooks/use-products", () => ({
  useProducts: () => ({
    data: {
      data: [
        { id: "p1", name: "Widget A", sku: "WA-001" },
        { id: "p2", name: "Widget B", sku: "WB-002" },
      ],
    },
  }),
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

vi.mock("@/modules/sales/presentation/schemas/sale.schema", () => ({
  createSaleSchema: { parse: vi.fn() },
  toCreateSaleDto: vi.fn((d: unknown) => d),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => vi.fn(),
}));

vi.mock("@/ui/components/currency-input", () => ({
  CurrencyInput: ({
    value,
  }: {
    value?: number;
    onChange?: (v: number) => void;
  }) => (
    <input data-testid="currency-input" type="number" defaultValue={value} />
  ),
}));

// --- Tests ---

describe("SaleFormPage", () => {
  it("Given: component renders When: rendering Then: should show create title and description", () => {
    render(<SaleFormPage />);

    expect(screen.getByText("form.createTitle")).toBeInTheDocument();
    expect(screen.getByText("form.createDescription")).toBeInTheDocument();
  });

  it("Given: component renders When: rendering Then: should show sale info and lines section cards", () => {
    render(<SaleFormPage />);

    expect(screen.getByText("form.saleInfo")).toBeInTheDocument();
    expect(screen.getByText("form.linesSection")).toBeInTheDocument();
  });

  it("Given: component renders When: rendering Then: should show warehouse, customer, external reference, and note fields", () => {
    render(<SaleFormPage />);

    expect(
      screen.getByText(
        (content) =>
          content.startsWith("fields.warehouse") &&
          !content.includes("Placeholder"),
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("fields.customer")).toBeInTheDocument();
    expect(screen.getByText("fields.externalReference")).toBeInTheDocument();
    expect(screen.getByText("fields.note")).toBeInTheDocument();
  });

  it("Given: component renders When: rendering Then: should show add line button", () => {
    render(<SaleFormPage />);

    expect(screen.getByText("actions.addLine")).toBeInTheDocument();
  });

  it("Given: component renders When: rendering Then: should show cancel and create buttons", () => {
    render(<SaleFormPage />);

    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("create")).toBeInTheDocument();
  });

  it("Given: component renders When: rendering Then: should render one product line by default with product, quantity, and salePrice fields", () => {
    render(<SaleFormPage />);

    expect(
      screen.getByText(
        (content) =>
          content.startsWith("fields.product") &&
          !content.includes("Placeholder"),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.startsWith("fields.quantity")),
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.startsWith("fields.salePrice")),
    ).toBeInTheDocument();
  });

  it("Given: component renders When: rendering Then: should render back link to sales list", () => {
    render(<SaleFormPage />);

    const links = screen.getAllByRole("link");
    const backLink = links.find(
      (link) => link.getAttribute("href") === "/dashboard/sales",
    );
    expect(backLink).toBeDefined();
  });

  it("Given: component renders When: rendering Then: should render a currency input for sale price", () => {
    render(<SaleFormPage />);

    expect(screen.getByTestId("currency-input")).toBeInTheDocument();
  });
});
