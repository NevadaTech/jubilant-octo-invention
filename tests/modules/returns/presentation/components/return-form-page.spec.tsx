import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReturnFormPage } from "@/modules/returns/presentation/components/return-form-page";

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

vi.mock("@/modules/returns/presentation/hooks/use-returns", () => ({
  useCreateReturn: () => ({
    isPending: false,
    isError: false,
    mutateAsync: vi.fn(),
  }),
}));

let mockProductsLoading = false;
let mockWarehousesLoading = false;
let mockSalesLoading = false;
let mockMovementsLoading = false;

vi.mock("@/modules/inventory/presentation/hooks/use-products", () => ({
  useProducts: () => ({
    data: {
      data: [
        { id: "p1", name: "Widget A", sku: "WA-001" },
        { id: "p2", name: "Widget B", sku: "WB-002" },
      ],
    },
    isLoading: mockProductsLoading,
  }),
}));

vi.mock("@/modules/inventory/presentation/hooks/use-warehouses", () => ({
  useWarehouses: () => ({
    data: {
      data: [
        { id: "wh-1", name: "Main Warehouse", code: "MW" },
        { id: "wh-2", name: "Secondary", code: "SW" },
      ],
    },
    isLoading: mockWarehousesLoading,
  }),
}));

vi.mock("@/modules/sales/presentation/hooks/use-sales", () => ({
  useSales: () => ({
    data: {
      data: [
        {
          id: "sale-1",
          saleNumber: "S-001",
          status: "CONFIRMED",
          warehouseName: "Main",
          currency: "USD",
          totalAmount: 1000,
        },
      ],
    },
    isLoading: mockSalesLoading,
  }),
  useSale: () => ({ data: null }),
}));

vi.mock("@/modules/inventory/presentation/hooks/use-movements", () => ({
  useMovements: () => ({
    data: {
      data: [
        {
          id: "mov-1",
          reference: "REF-001",
          warehouseName: "Main",
          totalQuantity: 50,
        },
      ],
    },
    isLoading: mockMovementsLoading,
  }),
  useMovement: () => ({ data: null }),
}));

vi.mock("@/modules/returns/presentation/schemas/return.schema", () => ({
  createReturnSchema: { parse: vi.fn() },
  toCreateReturnDto: vi.fn((d: unknown) => d),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => vi.fn(),
}));

vi.mock("@/ui/components/searchable-select", () => ({
  SearchableSelect: ({
    placeholder,
    value,
    onValueChange,
  }: {
    placeholder?: string;
    value?: string;
    onValueChange?: (v: string) => void;
  }) => (
    <select
      data-testid="searchable-select"
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
    >
      <option value="">{placeholder}</option>
    </select>
  ),
}));

vi.mock("@/ui/components/currency-input", () => ({
  CurrencyInput: ({
    value,
    onChange,
  }: {
    value?: number;
    onChange?: (v: number) => void;
  }) => (
    <input
      data-testid="currency-input"
      type="number"
      defaultValue={value}
      onChange={(e) => onChange?.(Number(e.target.value))}
    />
  ),
}));

// --- Tests ---

describe("ReturnFormPage", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockProductsLoading = false;
    mockWarehousesLoading = false;
    mockSalesLoading = false;
    mockMovementsLoading = false;
  });

  it("Given: data is loaded When: rendering Then: should show create title and description", () => {
    render(<ReturnFormPage />);

    expect(screen.getByText("form.createTitle")).toBeInTheDocument();
    expect(screen.getByText("form.createDescription")).toBeInTheDocument();
  });

  it("Given: data is loading When: rendering Then: should show skeleton placeholders instead of the form", () => {
    mockProductsLoading = true;

    const { container } = render(<ReturnFormPage />);

    // Skeletons render divs with specific height classes
    const skeletons = container.querySelectorAll(
      "[class*='h-7'], [class*='h-10'], [class*='h-6'], [class*='h-4']",
    );
    expect(skeletons.length).toBeGreaterThan(0);
    // Title and form should NOT be visible when loading
    expect(screen.queryByText("form.createTitle")).not.toBeInTheDocument();
  });

  it("Given: data is loaded When: rendering Then: should show return info card with type and warehouse fields", () => {
    render(<ReturnFormPage />);

    expect(screen.getByText("form.returnInfo")).toBeInTheDocument();
    // Label and placeholder both match, so use getAllByText
    expect(screen.getAllByText(/fields\.type/).length).toBeGreaterThanOrEqual(
      1,
    );
    expect(
      screen.getAllByText(/fields\.warehouse/).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("Given: default return type is RETURN_CUSTOMER When: rendering Then: should show sale reference field", () => {
    render(<ReturnFormPage />);

    // Default type is RETURN_CUSTOMER which shows the saleReference field
    expect(
      screen.getAllByText(/fields\.saleReference/).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("Given: data is loaded When: rendering Then: should show reason and note fields", () => {
    render(<ReturnFormPage />);

    expect(screen.getByText("fields.reason")).toBeInTheDocument();
    expect(screen.getByText("fields.note")).toBeInTheDocument();
  });

  it("Given: data is loaded When: rendering Then: should show lines section with product line", () => {
    render(<ReturnFormPage />);

    expect(screen.getByText("form.linesSection")).toBeInTheDocument();
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
  });

  it("Given: data is loaded When: rendering Then: should show cancel and create buttons", () => {
    render(<ReturnFormPage />);

    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("create")).toBeInTheDocument();
  });

  it("Given: data is loaded When: rendering Then: should render a back link to returns list", () => {
    render(<ReturnFormPage />);

    const links = screen.getAllByRole("link");
    const backLink = links.find(
      (link) => link.getAttribute("href") === "/dashboard/returns",
    );
    expect(backLink).toBeDefined();
  });
});
