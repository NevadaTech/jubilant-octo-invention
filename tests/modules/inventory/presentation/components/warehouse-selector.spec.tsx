import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WarehouseSelector } from "@/modules/inventory/presentation/components/warehouses/warehouse-selector";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const mockWarehouses = {
  data: [
    { id: "wh-1", displayName: "Main Warehouse" },
    { id: "wh-2", displayName: "Secondary Warehouse" },
  ],
};

let mockQueryState: {
  data: typeof mockWarehouses | undefined;
  isLoading: boolean;
};
let mockSelectedId: string | null;
const mockSetSelected = vi.fn();

vi.mock("@/modules/inventory/presentation/hooks", () => ({
  useWarehouses: () => mockQueryState,
  useSelectedWarehouseId: () => mockSelectedId,
  useSetSelectedWarehouse: () => mockSetSelected,
}));

describe("WarehouseSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryState = { data: mockWarehouses, isLoading: false };
    mockSelectedId = null;
  });

  it("Given: warehouses are loading When: rendering Then: should show loading button with loading text", () => {
    mockQueryState = { data: undefined, isLoading: true };
    render(<WarehouseSelector />);
    expect(screen.getByText("selector.loading")).toBeInTheDocument();
  });

  it("Given: warehouses loaded and none selected When: rendering Then: should display 'all' label", () => {
    render(<WarehouseSelector />);
    // The button displays the "all" text when no warehouse is selected
    expect(screen.getAllByText("selector.all").length).toBeGreaterThanOrEqual(
      1,
    );
  });

  it("Given: a warehouse is selected When: rendering Then: should display the selected warehouse name", () => {
    mockSelectedId = "wh-1";
    render(<WarehouseSelector />);
    expect(screen.getAllByText("Main Warehouse").length).toBeGreaterThanOrEqual(
      1,
    );
  });

  it("Given: warehouses loaded When: rendering Then: should have a native select with all warehouse options", () => {
    render(<WarehouseSelector />);
    const select = screen.getByLabelText("selector.label");
    expect(select).toBeInTheDocument();
    expect(select.querySelectorAll("option")).toHaveLength(3); // "all" + 2 warehouses
  });

  it("Given: warehouses loaded When: selecting a warehouse from the native select Then: should call setSelected with the warehouse id", () => {
    render(<WarehouseSelector />);
    const select = screen.getByLabelText("selector.label");
    fireEvent.change(select, { target: { value: "wh-2" } });
    expect(mockSetSelected).toHaveBeenCalledWith("wh-2");
  });

  it("Given: a warehouse is selected When: selecting the 'all' option Then: should call setSelected with null", () => {
    mockSelectedId = "wh-1";
    render(<WarehouseSelector />);
    const select = screen.getByLabelText("selector.label");
    fireEvent.change(select, { target: { value: "" } });
    expect(mockSetSelected).toHaveBeenCalledWith(null);
  });
});
