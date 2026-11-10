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

  it("Given: default filters When: rendering Then: should show search and filter fields without a click", () => {
    render(
      <AuditLogFiltersBar
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(
      screen.getByPlaceholderText("filters.entityIdPlaceholder"),
    ).toBeDefined();
    expect(screen.getByText("filters.entityType")).toBeDefined();
    expect(screen.getByText("filters.action")).toBeDefined();
    expect(screen.getByText("filters.httpMethod")).toBeDefined();
    expect(screen.getByText("filters.performedBy")).toBeDefined();
    expect(screen.getByText("filters.dateRange")).toBeDefined();
    expect(screen.queryByText("filter")).toBeNull();
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

  it("Given: empty entity id When: user types Then: should call onFiltersChange with entityId and page 1", () => {
    render(
      <AuditLogFiltersBar
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.change(
      screen.getByPlaceholderText("filters.entityIdPlaceholder"),
      { target: { value: "entity-42" } },
    );
    expect(mockOnChange).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      entityId: "entity-42",
    });
  });

  it("Given: visible entity type select When: choosing User Then: should call onFiltersChange with entityType", () => {
    render(
      <AuditLogFiltersBar
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByLabelText("filters.entityType"));
    fireEvent.click(screen.getByRole("option", { name: "User" }));
    expect(mockOnChange).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      entityType: "User",
    });
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
