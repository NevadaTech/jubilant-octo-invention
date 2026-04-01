import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductSearchSelect } from "@/modules/inventory/presentation/components/shared/product-search-select";

// --- Mocks ---

vi.mock("@/modules/inventory/presentation/hooks/use-product-search", () => ({
  useProductSearch: () => ({
    products: [
      {
        id: "p1",
        name: "Widget A",
        sku: "SKU-001",
        barcode: "BAR-001",
      },
      {
        id: "p2",
        name: "Widget B",
        sku: "SKU-002",
        barcode: "BAR-002",
      },
    ],
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isError: false,
  }),
}));

// --- Tests ---

describe("ProductSearchSelect", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const renderWithProviders = (ui: React.ReactElement) =>
    render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    );

  it("Given: component is mounted When: rendering Then: should show placeholder text", () => {
    renderWithProviders(
      <ProductSearchSelect placeholder="Select a product..." />,
    );

    expect(screen.getByText("Select a product...")).toBeInTheDocument();
  });

  it("Given: component is mounted When: clicking trigger Then: should open dropdown", async () => {
    renderWithProviders(<ProductSearchSelect />);

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Widget A")).toBeInTheDocument();
      expect(screen.getByText("Widget B")).toBeInTheDocument();
    });
  });

  it("Given: dropdown is open When: rendering Then: should show search input", async () => {
    renderWithProviders(<ProductSearchSelect />);

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(
        /buscar por nombre, sku o barcode/i,
      );
      expect(searchInput).toBeInTheDocument();
    });
  });

  it("Given: dropdown is open When: clicking a product Then: should select it", async () => {
    const mockOnValueChange = vi.fn();
    renderWithProviders(
      <ProductSearchSelect onValueChange={mockOnValueChange} />,
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    await waitFor(() => {
      const widgetAOption = screen.getByText("Widget A");
      fireEvent.click(widgetAOption);
    });

    expect(mockOnValueChange).toHaveBeenCalledWith("p1");
  });

  it("Given: product is selected When: rendering Then: should show selected product name and SKU", async () => {
    const { rerender } = renderWithProviders(
      <ProductSearchSelect value="p1" />,
    );

    // Initially should show the selected value
    await waitFor(() => {
      expect(screen.getByText(/Widget A.*SKU-001/)).toBeInTheDocument();
    });
  });

  it("Given: dropdown is open When: pressing Escape Then: should close dropdown", async () => {
    renderWithProviders(<ProductSearchSelect />);

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Widget A")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      /buscar por nombre, sku o barcode/i,
    );
    fireEvent.keyDown(searchInput, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByText("Widget A")).not.toBeInTheDocument();
    });
  });

  it("Given: component is disabled When: rendering Then: should not respond to clicks", async () => {
    const mockOnValueChange = vi.fn();
    renderWithProviders(
      <ProductSearchSelect disabled onValueChange={mockOnValueChange} />,
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    // Dropdown should not open
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(screen.queryByText("Widget A")).not.toBeInTheDocument();
  });

  it("Given: products are loaded When: rendering dropdown Then: should show SKU and barcode in items", async () => {
    renderWithProviders(<ProductSearchSelect />);

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    await waitFor(() => {
      // Check that SKU and barcode are displayed
      expect(screen.getByText(/SKU-001.*BAR-001/)).toBeInTheDocument();
      expect(screen.getByText(/SKU-002.*BAR-002/)).toBeInTheDocument();
    });
  });

  it("Given: companyId is provided When: rendering Then: should pass it to the hook", async () => {
    const mockOnValueChange = vi.fn();
    renderWithProviders(
      <ProductSearchSelect
        companyId="comp-123"
        onValueChange={mockOnValueChange}
      />,
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Widget A")).toBeInTheDocument();
    });
  });

  it("Given: product is selected When: clicking trigger again Then: should show dropdown with selection marked", async () => {
    const mockOnValueChange = vi.fn();
    const { rerender } = renderWithProviders(
      <ProductSearchSelect value="p1" onValueChange={mockOnValueChange} />,
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    await waitFor(() => {
      const widgetAItem = screen.getByText("Widget A");
      // The selected item should have a check mark
      expect(widgetAItem.closest('[role="option"]')).toHaveClass("bg-accent");
    });
  });
});
