import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuditLogFiltersBar } from "@/modules/audit/presentation/components/audit-log-filters";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

vi.mock("@/shared/presentation/hooks", () => ({
  useDebounce: (value: string) => value,
}));

vi.mock("@/modules/users/presentation/hooks/use-users", () => ({
  useUsers: () => ({
    data: { data: [{ id: "user-1", fullName: "John Doe" }] },
  }),
}));

describe("AuditLogFiltersBar", () => {
  const defaultFilters = { page: 1, limit: 10 };
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Given: default filters When: rendering Then: should render search input for entity ID", () => {
    render(
      <AuditLogFiltersBar
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(
      screen.getByPlaceholderText("filters.entityIdPlaceholder"),
    ).toBeDefined();
  });

  it("Given: default filters When: rendering Then: should render filter button", () => {
    render(
      <AuditLogFiltersBar
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("filter")).toBeDefined();
  });

  it("Given: filters with entityType When: rendering Then: should show clear button", () => {
    render(
      <AuditLogFiltersBar
        filters={{ ...defaultFilters, entityType: "User" }}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("clearFilters")).toBeDefined();
  });

  it("Given: no active filters When: rendering Then: should not show clear button", () => {
    render(
      <AuditLogFiltersBar
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.queryByText("clearFilters")).toBeNull();
  });

  it("Given: rendered component When: clicking filter button Then: should show filter panel", () => {
    render(
      <AuditLogFiltersBar
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByText("filter"));
    expect(screen.getByText("filters.entityType")).toBeDefined();
    expect(screen.getByText("filters.action")).toBeDefined();
    expect(screen.getByText("filters.httpMethod")).toBeDefined();
    expect(screen.getByText("filters.performedBy")).toBeDefined();
  });

  it("Given: active filters When: clicking clear Then: should reset all filters", () => {
    render(
      <AuditLogFiltersBar
        filters={{ ...defaultFilters, entityType: "User", action: "CREATE" }}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByText("clearFilters"));
    expect(mockOnChange).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });
});
