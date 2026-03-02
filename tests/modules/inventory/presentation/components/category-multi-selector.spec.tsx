import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CategoryMultiSelector } from "@/modules/inventory/presentation/components/categories/category-multi-selector";

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

let mockQueryState: {
  data: typeof mockCategories | undefined;
  isLoading: boolean;
};

vi.mock("@/modules/inventory/presentation/hooks/use-categories", () => ({
  useCategories: () => mockQueryState,
}));

describe("CategoryMultiSelector", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryState = { data: mockCategories, isLoading: false };
  });

  it("Given: no categories selected When: rendering Then: should show the 'none' placeholder text", () => {
    render(<CategoryMultiSelector value={[]} onChange={mockOnChange} />);
    expect(screen.getByText("selector.none")).toBeInTheDocument();
  });

  it("Given: categories selected When: rendering Then: should show badges for selected categories", () => {
    render(
      <CategoryMultiSelector
        value={["cat-1", "cat-3"]}
        onChange={mockOnChange}
      />,
    );
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.queryByText("Clothing")).not.toBeInTheDocument();
  });

  it("Given: a category is selected When: clicking its remove button Then: should call onChange without that category", () => {
    render(
      <CategoryMultiSelector
        value={["cat-1", "cat-2"]}
        onChange={mockOnChange}
      />,
    );
    // Each badge has an X button — get the first remove button (for Electronics)
    const removeButtons = screen
      .getAllByRole("button", { hidden: true })
      .filter((btn) => btn.querySelector("svg"));
    fireEvent.click(removeButtons[0]);
    expect(mockOnChange).toHaveBeenCalledWith(["cat-2"]);
  });

  it("Given: available categories exist When: clicking add button Then: should show the dropdown with unselected categories", () => {
    render(<CategoryMultiSelector value={["cat-1"]} onChange={mockOnChange} />);
    fireEvent.click(screen.getByText("selector.add"));
    expect(screen.getByText("Clothing")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
  });

  it("Given: dropdown is open When: clicking an available category Then: should call onChange with the new category added", () => {
    render(<CategoryMultiSelector value={["cat-1"]} onChange={mockOnChange} />);
    fireEvent.click(screen.getByText("selector.add"));
    fireEvent.click(screen.getByText("Clothing"));
    expect(mockOnChange).toHaveBeenCalledWith(["cat-1", "cat-2"]);
  });

  it("Given: disabled prop When: rendering with selected categories Then: should not show remove buttons or add button", () => {
    render(
      <CategoryMultiSelector
        value={["cat-1"]}
        onChange={mockOnChange}
        disabled
      />,
    );
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    // No add button should be rendered when disabled
    expect(screen.queryByText("selector.add")).not.toBeInTheDocument();
  });
});
