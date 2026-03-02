import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductFormPage } from "@/modules/inventory/presentation/components/products/product-form-page";

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

let mockProductData: {
  data: {
    id: string;
    sku: string;
    name: string;
    description: string | null;
    unitOfMeasure: string;
    price: number;
    categories: { id: string; name: string }[];
  } | null;
  isLoading: boolean;
};

vi.mock("@/modules/inventory/presentation/hooks/use-products", () => ({
  useCreateProduct: () => ({
    isPending: false,
    isError: false,
    error: null,
    mutateAsync: vi.fn(),
  }),
  useUpdateProduct: () => ({
    isPending: false,
    isError: false,
    error: null,
    mutateAsync: vi.fn(),
  }),
  useProduct: () => mockProductData,
}));

vi.mock(
  "@/modules/inventory/presentation/components/categories/category-multi-selector",
  () => ({
    CategoryMultiSelector: ({ value }: { value: string[] }) => (
      <div data-testid="category-multi-selector">{value.length} selected</div>
    ),
  }),
);

vi.mock("@/modules/inventory/presentation/schemas/product.schema", () => ({
  createProductSchema: { parse: vi.fn() },
  toCreateProductDto: vi.fn((d: unknown) => d),
  toUpdateProductDto: vi.fn((d: unknown) => d),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => vi.fn(),
}));

vi.mock("@/ui/components/currency-input", () => ({
  CurrencyInput: ({
    id,
    value,
  }: {
    id?: string;
    value?: number;
    onChange?: (v: number) => void;
  }) => (
    <input
      data-testid={id || "currency-input"}
      type="number"
      defaultValue={value}
    />
  ),
}));

// --- Tests ---

describe("ProductFormPage", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockProductData = { data: null, isLoading: false };
  });

  it("Given: no productId When: rendering Then: should show create title and description", () => {
    render(<ProductFormPage />);

    expect(screen.getByText("form.createTitle")).toBeInTheDocument();
    expect(screen.getByText("form.createDescription")).toBeInTheDocument();
  });

  it("Given: no productId When: rendering Then: should show all form fields", () => {
    render(<ProductFormPage />);

    expect(screen.getByText(/fields\.sku/)).toBeInTheDocument();
    expect(screen.getByText(/fields\.name/)).toBeInTheDocument();
    expect(screen.getByText("fields.description")).toBeInTheDocument();
    expect(screen.getByText("fields.category")).toBeInTheDocument();
    expect(screen.getByText(/fields\.unitOfMeasure/)).toBeInTheDocument();
    expect(screen.getByText("fields.price")).toBeInTheDocument();
  });

  it("Given: no productId When: rendering Then: should show product info card title", () => {
    render(<ProductFormPage />);

    expect(screen.getByText("form.productInfo")).toBeInTheDocument();
  });

  it("Given: no productId When: rendering Then: should show cancel and create buttons", () => {
    render(<ProductFormPage />);

    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("create")).toBeInTheDocument();
  });

  it("Given: no productId When: rendering Then: should render category multi-selector", () => {
    render(<ProductFormPage />);

    expect(screen.getByTestId("category-multi-selector")).toBeInTheDocument();
  });

  it("Given: productId with loading state When: rendering Then: should show loading spinner", () => {
    mockProductData = { data: null, isLoading: true };

    const { container } = render(<ProductFormPage productId="prod-1" />);

    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("Given: productId with loaded data When: rendering Then: should show edit title", () => {
    mockProductData = {
      data: {
        id: "prod-1",
        sku: "SKU-001",
        name: "Widget A",
        description: "A widget",
        unitOfMeasure: "unit",
        price: 10,
        categories: [{ id: "cat-1", name: "Electronics" }],
      },
      isLoading: false,
    };

    render(<ProductFormPage productId="prod-1" />);

    expect(screen.getByText("form.editTitle")).toBeInTheDocument();
    expect(screen.getByText("form.editDescription")).toBeInTheDocument();
  });

  it("Given: productId with loaded data When: rendering Then: should show save button instead of create", () => {
    mockProductData = {
      data: {
        id: "prod-1",
        sku: "SKU-001",
        name: "Widget A",
        description: null,
        unitOfMeasure: "unit",
        price: 10,
        categories: [],
      },
      isLoading: false,
    };

    render(<ProductFormPage productId="prod-1" />);

    expect(screen.getByText("save")).toBeInTheDocument();
    expect(screen.queryByText("create")).not.toBeInTheDocument();
  });

  it("Given: no productId When: rendering Then: should render back link to products list", () => {
    render(<ProductFormPage />);

    const links = screen.getAllByRole("link");
    const backLink = links.find(
      (link) => link.getAttribute("href") === "/dashboard/inventory/products",
    );
    expect(backLink).toBeDefined();
  });
});
