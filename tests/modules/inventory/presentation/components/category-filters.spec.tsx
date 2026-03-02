import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CategoryFiltersComponent } from "@/modules/inventory/presentation/components/categories/category-filters";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/shared/presentation/hooks", () => ({
  useDebounce: (value: string) => value,
}));

describe("CategoryFiltersComponent", () => {
  const defaultFilters = { page: 1, limit: 10 };
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Given: default filters When: rendering Then: should render search input", () => {
    render(
      <CategoryFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByPlaceholderText("search.placeholder")).toBeDefined();
  });

  it("Given: default filters When: rendering Then: should render filter toggle button", () => {
    render(
      <CategoryFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("filter")).toBeDefined();
  });

  it("Given: filters with search When: rendering Then: should show clear button", () => {
    render(
      <CategoryFiltersComponent
        filters={{ ...defaultFilters, search: "test" }}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("clearFilters")).toBeDefined();
  });

  it("Given: default filters When: no active filters Then: should not show clear button", () => {
    render(
      <CategoryFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.queryByText("clearFilters")).toBeNull();
  });

  it("Given: rendered component When: clicking filter toggle Then: should show filter panel", () => {
    render(
      <CategoryFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByText("filter"));
    expect(screen.getByText("filters.status")).toBeDefined();
  });

  it("Given: active filters When: clicking clear Then: should call onFiltersChange with cleared values", () => {
    render(
      <CategoryFiltersComponent
        filters={{ ...defaultFilters, search: "test", statuses: ["ACTIVE"] }}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByText("clearFilters"));
    expect(mockOnChange).toHaveBeenCalledWith({
      search: undefined,
      statuses: undefined,
      page: 1,
    });
  });
});
