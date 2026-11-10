import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserFiltersComponent } from "@/modules/users/presentation/components/user-filters";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/shared/presentation/hooks", () => ({
  useDebounce: (value: string) => value,
}));

describe("UserFiltersComponent", () => {
  const defaultFilters = { page: 1, limit: 10 };
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Given: default filters When: rendering Then: should show search and status without a click", () => {
    render(
      <UserFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByPlaceholderText("search.placeholder")).toBeDefined();
    expect(screen.getByText("filters.status")).toBeDefined();
    expect(screen.queryByText("filter")).toBeNull();
  });

  it("Given: filters with status When: rendering Then: should show clear button", () => {
    render(
      <UserFiltersComponent
        filters={{ ...defaultFilters, status: ["ACTIVE"] }}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("clearFilters")).toBeDefined();
  });

  it("Given: no active filters When: rendering Then: should not show clear button", () => {
    render(
      <UserFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.queryByText("clearFilters")).toBeNull();
  });

  it("Given: empty search When: user types Then: should call onFiltersChange with search and page 1", () => {
    render(
      <UserFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("search.placeholder"), {
      target: { value: "john" },
    });
    expect(mockOnChange).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: "john",
    });
  });

  it("Given: visible status filter When: selecting ACTIVE Then: should call onFiltersChange with status", () => {
    render(
      <UserFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "status.active" }));
    expect(mockOnChange).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: ["ACTIVE"],
    });
  });

  it("Given: active filters When: clicking clear Then: should reset filters", () => {
    render(
      <UserFiltersComponent
        filters={{ ...defaultFilters, status: ["ACTIVE"], search: "john" }}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByText("clearFilters"));
    expect(mockOnChange).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });
});
