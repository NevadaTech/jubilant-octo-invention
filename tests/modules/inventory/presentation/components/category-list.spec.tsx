import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryList } from "@/modules/inventory/presentation/components/categories/category-list";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock(
  "@/modules/inventory/presentation/components/categories/category-filters",
  () => ({
    CategoryFiltersComponent: () => <div data-testid="category-filters" />,
  }),
);

vi.mock(
  "@/modules/inventory/presentation/components/categories/category-form",
  () => ({
    CategoryForm: () => <div data-testid="category-form" />,
  }),
);

const mockData = {
  data: [
    {
      id: "cat-1",
      name: "Electronics",
      description: "Electronic items",
      parentName: null,
      productCount: 5,
      isActive: true,
    },
    {
      id: "cat-2",
      name: "Clothing",
      description: null,
      parentName: "Fashion",
      productCount: 0,
      isActive: false,
    },
  ],
  pagination: { page: 1, totalPages: 1, total: 2, limit: 10 },
};

let mockQueryState: {
  data: typeof mockData | undefined;
  isLoading: boolean;
  isError: boolean;
} = {
  data: mockData,
  isLoading: false,
  isError: false,
};

vi.mock("@/modules/inventory/presentation/hooks/use-categories", () => ({
  useCategories: () => mockQueryState,
  useDeleteCategory: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock("@/modules/inventory/presentation/hooks/use-inventory-store", () => ({
  useCategoryFilters: () => ({ page: 1, limit: 10 }),
  useSetCategoryFilters: () => vi.fn(),
  useCategoryFormState: () => ({
    isOpen: false,
    editingId: null,
    open: vi.fn(),
    close: vi.fn(),
  }),
}));

describe("CategoryList", () => {
  beforeEach(() => {
    mockQueryState = { data: mockData, isLoading: false, isError: false };
  });

  it("Given: categories data When: rendering Then: should show list title", () => {
    render(<CategoryList />);
    expect(screen.getByText("list.title")).toBeInTheDocument();
  });

  it("Given: categories data When: rendering Then: should show category names in table", () => {
    render(<CategoryList />);
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Clothing")).toBeInTheDocument();
  });

  it("Given: categories data When: rendering Then: should show parent category name", () => {
    render(<CategoryList />);
    expect(screen.getByText("Fashion")).toBeInTheDocument();
  });

  it("Given: categories data When: rendering Then: should show product count", () => {
    render(<CategoryList />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("Given: categories data When: rendering Then: should show new button", () => {
    render(<CategoryList />);
    expect(screen.getByText("actions.new")).toBeInTheDocument();
  });

  it("Given: categories data When: rendering Then: should render category filters child", () => {
    render(<CategoryList />);
    expect(screen.getByTestId("category-filters")).toBeInTheDocument();
  });

  it("Given: categories data When: rendering Then: should render category form child", () => {
    render(<CategoryList />);
    expect(screen.getByTestId("category-form")).toBeInTheDocument();
  });

  it("Given: active category When: rendering Then: should show active status badge", () => {
    render(<CategoryList />);
    expect(screen.getByText("status.active")).toBeInTheDocument();
  });

  it("Given: inactive category When: rendering Then: should show inactive status badge", () => {
    render(<CategoryList />);
    expect(screen.getByText("status.inactive")).toBeInTheDocument();
  });

  it("Given: empty categories When: rendering Then: should show empty state", () => {
    mockQueryState = {
      data: {
        data: [],
        pagination: { page: 1, totalPages: 0, total: 0, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<CategoryList />);
    expect(screen.getByText("empty.title")).toBeInTheDocument();
    expect(screen.getByText("empty.description")).toBeInTheDocument();
  });

  it("Given: loading state When: rendering Then: should show title but no table data", () => {
    mockQueryState = { data: undefined, isLoading: true, isError: false };
    render(<CategoryList />);
    expect(screen.getByText("list.title")).toBeInTheDocument();
    expect(screen.queryByText("Electronics")).not.toBeInTheDocument();
  });

  it("Given: error state When: rendering Then: should show error message", () => {
    mockQueryState = { data: undefined, isLoading: false, isError: true };
    render(<CategoryList />);
    expect(screen.getByText("error.loading")).toBeInTheDocument();
  });

  it("Given: error state When: rendering Then: should not show table", () => {
    mockQueryState = { data: undefined, isLoading: false, isError: true };
    render(<CategoryList />);
    expect(screen.queryByText("list.title")).not.toBeInTheDocument();
    expect(screen.queryByText("actions.new")).not.toBeInTheDocument();
  });

  it("Given: category with description When: rendering Then: should show description", () => {
    render(<CategoryList />);
    expect(screen.getByText("Electronic items")).toBeInTheDocument();
  });

  it("Given: category without parent When: rendering Then: should show dash placeholder", () => {
    render(<CategoryList />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });
});
