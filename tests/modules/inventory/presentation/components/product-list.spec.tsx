import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductList } from "@/modules/inventory/presentation/components/products/product-list";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock(
  "@/modules/inventory/presentation/components/products/product-filters",
  () => ({
    ProductFilters: () => <div data-testid="product-filters" />,
  }),
);

vi.mock(
  "@/modules/inventory/presentation/components/products/product-reference-photo",
  () => ({
    ProductReferencePhoto: () => <div data-testid="product-photo" />,
    ProductReferenceThumb: () => <div data-testid="product-photo-thumb" />,
  }),
);

const mockProducts = {
  data: [
    {
      id: "p-1",
      name: "Widget",
      sku: "WDG-001",
      categories: [{ id: "c-1", name: "Hardware" }],
      price: 29.99,
      isActive: true,
      unitOfMeasure: "unit",
    },
    {
      id: "p-2",
      name: "Gadget",
      sku: "GDG-001",
      categories: [],
      price: 0,
      isActive: false,
      unitOfMeasure: "unit",
    },
  ],
  pagination: { page: 1, totalPages: 1, total: 2, limit: 10 },
};

let mockQueryState: {
  data: typeof mockProducts | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
} = {
  data: mockProducts,
  isLoading: false,
  isError: false,
  error: null,
};

let lastProductListFilters: Record<string, unknown> | undefined;
let mockSelectedCompanyId: string | null = null;

vi.mock("@/modules/inventory/presentation/hooks", () => ({
  useProducts: (filters?: Record<string, unknown>) => {
    lastProductListFilters = filters;
    return mockQueryState;
  },
  useProductFilters: () => ({ page: 1, limit: 10 }),
  useSetProductFilters: () => vi.fn(),
}));

vi.mock("@/modules/companies/infrastructure/store/company.store", () => ({
  useCompanyStore: (
    selector: (s: { selectedCompanyId: string | null }) => unknown,
  ) => selector({ selectedCompanyId: mockSelectedCompanyId }),
}));

describe("ProductList", () => {
  beforeEach(() => {
    lastProductListFilters = undefined;
    mockSelectedCompanyId = null;
    mockQueryState = {
      data: mockProducts,
      isLoading: false,
      isError: false,
      error: null,
    };
  });

  it("Given: product data When: rendering Then: should show list title", () => {
    render(<ProductList />);
    expect(screen.getByText("list.title")).toBeInTheDocument();
  });

  it("Given: product data When: rendering Then: should show product names", () => {
    render(<ProductList />);
    expect(screen.getByText("Widget")).toBeInTheDocument();
    expect(screen.getByText("Gadget")).toBeInTheDocument();
  });

  it("Given: product data When: rendering Then: should show SKU codes", () => {
    render(<ProductList />);
    expect(screen.getByText("WDG-001")).toBeInTheDocument();
    expect(screen.getByText("GDG-001")).toBeInTheDocument();
  });

  it("Given: product with categories When: rendering Then: should show category badge", () => {
    render(<ProductList />);
    expect(screen.getByText("Hardware")).toBeInTheDocument();
  });

  it("Given: product data When: rendering Then: should show new product button", () => {
    render(<ProductList />);
    expect(screen.getByText("actions.new")).toBeInTheDocument();
  });

  it("Given: product data When: rendering Then: should render product filters child", () => {
    render(<ProductList />);
    expect(screen.getByTestId("product-filters")).toBeInTheDocument();
  });

  it("Given: active product When: rendering Then: should show active status badge", () => {
    render(<ProductList />);
    expect(screen.getByText("status.active")).toBeInTheDocument();
  });

  it("Given: inactive product When: rendering Then: should show inactive status badge", () => {
    render(<ProductList />);
    expect(screen.getByText("status.inactive")).toBeInTheDocument();
  });

  it("Given: product with price When: rendering Then: should show formatted price", () => {
    render(<ProductList />);
    expect(screen.getByText("$29.99")).toBeInTheDocument();
  });

  it("Given: product with zero price When: rendering Then: should show N/A", () => {
    render(<ProductList />);
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("Given: empty products When: rendering Then: should show empty state", () => {
    mockQueryState = {
      data: {
        data: [],
        pagination: { page: 1, totalPages: 0, total: 0, limit: 10 },
      },
      isLoading: false,
      isError: false,
      error: null,
    };
    render(<ProductList />);
    expect(screen.getByText("empty.title")).toBeInTheDocument();
    expect(screen.getByText("empty.description")).toBeInTheDocument();
  });

  it("Given: loading state When: rendering Then: should show title but no product data", () => {
    mockQueryState = {
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    };
    render(<ProductList />);
    expect(screen.getByText("list.title")).toBeInTheDocument();
    expect(screen.queryByText("Widget")).not.toBeInTheDocument();
  });

  it("Given: error state When: rendering Then: should show error message", () => {
    mockQueryState = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Network error"),
    };
    render(<ProductList />);
    expect(screen.getByText(/error\.loading/)).toBeInTheDocument();
  });

  it("Given: error state When: rendering Then: should not show title or table", () => {
    mockQueryState = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Failed"),
    };
    render(<ProductList />);
    expect(screen.queryByText("list.title")).not.toBeInTheDocument();
    expect(screen.queryByText("actions.new")).not.toBeInTheDocument();
  });

  it("Given: product with barcode When: rendering Then: should show barcode next to SKU", () => {
    mockQueryState = {
      data: {
        data: [
          {
            id: "p-bc",
            name: "Product With Barcode",
            sku: "PWB-001",
            barcode: "7501234567890",
            categories: [],
            price: 10,
            isActive: true,
            unitOfMeasure: "unit",
          },
        ],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      isLoading: false,
      isError: false,
      error: null,
    };
    render(<ProductList />);
    expect(screen.getByText("PWB-001")).toBeInTheDocument();
    expect(screen.getByText("7501234567890")).toBeInTheDocument();
  });

  it("Given: product without barcode When: rendering Then: should not render barcode element", () => {
    mockQueryState = {
      data: {
        data: [
          {
            id: "p-nobc",
            name: "Product No Barcode",
            sku: "PNB-001",
            categories: [],
            price: 10,
            isActive: true,
            unitOfMeasure: "unit",
          },
        ],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      isLoading: false,
      isError: false,
      error: null,
    };
    const { container } = render(<ProductList />);
    expect(screen.getByText("PNB-001")).toBeInTheDocument();
    expect(container.querySelector('[aria-label="fields.barcode"]')).toBeNull();
  });

  it("Given: selectedCompanyId When: product admin list loads Then: useProducts receives ownership companyId", () => {
    mockSelectedCompanyId = "admin-company-keep";
    render(<ProductList />);

    expect(lastProductListFilters).toEqual(
      expect.objectContaining({ companyId: "admin-company-keep" }),
    );
  });

  it("Given: selectedCompanyId is null When: product admin list loads Then: useProducts omits companyId", () => {
    mockSelectedCompanyId = null;
    render(<ProductList />);

    expect(lastProductListFilters).toBeDefined();
    expect(lastProductListFilters).not.toHaveProperty("companyId");
  });
});
