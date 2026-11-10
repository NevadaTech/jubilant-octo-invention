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

  it("Given: default filters When: rendering Then: should show search and status without a click", () => {
    render(
      <CategoryFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByPlaceholderText("search.placeholder")).toBeDefined();
    expect(screen.getByText("filters.status")).toBeDefined();
    expect(screen.queryByText("filter")).toBeNull();
  });

  it("Given: empty search When: user types Then: should call onFiltersChange with search and page 1", () => {
    render(
      <CategoryFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("search.placeholder"), {
      target: { value: "test" },
    });
    expect(mockOnChange).toHaveBeenCalledWith({
      search: "test",
      page: 1,
    });
  });

  it("Given: active search When: user clears the field Then: should reset search", () => {
    render(
      <CategoryFiltersComponent
        filters={{ ...defaultFilters, search: "test" }}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("search.placeholder"), {
      target: { value: "" },
    });
    expect(mockOnChange).toHaveBeenCalledWith({
      search: undefined,
      page: 1,
    });
  });

  it("Given: visible status filter When: selecting ACTIVE Then: should call onFiltersChange with statuses", () => {
    render(
      <CategoryFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "status.active" }));
    expect(mockOnChange).toHaveBeenCalledWith({
      statuses: ["ACTIVE"],
      page: 1,
    });
  });

  it("Given: selected status When: clearing the selection Then: should reset statuses", () => {
    render(
      <CategoryFiltersComponent
        filters={{ ...defaultFilters, statuses: ["ACTIVE"] }}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(mockOnChange).toHaveBeenCalledWith({
      statuses: undefined,
      page: 1,
    });
  });
});
