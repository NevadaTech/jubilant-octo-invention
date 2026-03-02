import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CategorySelector } from "@/modules/inventory/presentation/components/categories/category-selector";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const mockCategories = {
  data: [
    { id: "cat-1", name: "Electronics" },
    { id: "cat-2", name: "Clothing" },
    { id: "cat-3", name: "Food" },
  ],
};

let mockQueryState: { data: typeof mockCategories | undefined; isLoading: boolean };

vi.mock("@/modules/inventory/presentation/hooks/use-categories", () => ({
  useCategories: () => mockQueryState,
}));

describe("CategorySelector", () => {
  const mockOnValueChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryState = { data: mockCategories, isLoading: false };
  });

  it("Given: categories loaded When: rendering with includeAll Then: should render the select trigger", () => {
    render(<CategorySelector value="" onValueChange={mockOnValueChange} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeInTheDocument();
  });

  it("Given: categories are loading When: rendering Then: should show loading placeholder and disable trigger", () => {
    mockQueryState = { data: undefined, isLoading: true };
    render(<CategorySelector value="" onValueChange={mockOnValueChange} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
    expect(screen.getByText("selector.loading")).toBeInTheDocument();
  });

  it("Given: categories loaded When: rendering with no value Then: should show default placeholder", () => {
    render(<CategorySelector value="" onValueChange={mockOnValueChange} />);
    expect(screen.getByText("selector.label")).toBeInTheDocument();
  });

  it("Given: disabled prop When: rendering Then: should disable the trigger", () => {
    render(<CategorySelector value="" onValueChange={mockOnValueChange} disabled />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
  });

  it("Given: categories loaded When: opening dropdown Then: should show all category options and 'all' option", () => {
    render(<CategorySelector value="" onValueChange={mockOnValueChange} includeAll />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("selector.all")).toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Clothing")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
  });

  it("Given: includeAll is false When: opening dropdown Then: should not show the 'all' option", () => {
    render(<CategorySelector value="" onValueChange={mockOnValueChange} includeAll={false} />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.queryByText("selector.all")).not.toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
  });
});
