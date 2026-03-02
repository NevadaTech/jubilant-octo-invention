import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductList } from "@/modules/inventory/presentation/components/products/product-list";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock(
  "@/modules/inventory/presentation/components/products/product-filters",
  () => ({
    ProductFilters: () => <div data-testid="product-filters" />,
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

vi.mock("@/modules/inventory/presentation/hooks", () => ({
  useProducts: () => mockQueryState,
  useProductFilters: () => ({ page: 1, limit: 10 }),
  useSetProductFilters: () => vi.fn(),
}));

describe("ProductList", () => {
  beforeEach(() => {
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
});
