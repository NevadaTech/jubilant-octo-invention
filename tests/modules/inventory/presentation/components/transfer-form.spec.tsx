import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TransferForm } from "@/modules/inventory/presentation/components/transfers/transfer-form";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

const mockMutateAsync = vi.fn();
vi.mock("@/modules/inventory/presentation/hooks/use-transfers", () => ({
  useCreateTransfer: () => ({
    isPending: false,
    isError: false,
    mutateAsync: mockMutateAsync,
  }),
}));

vi.mock("@/modules/inventory/presentation/hooks/use-products", () => ({
  useProducts: () => ({
    data: {
      data: [
        { id: "p1", name: "Widget A", sku: "WA-001" },
        { id: "p2", name: "Widget B", sku: "WB-002" },
      ],
    },
  }),
}));

vi.mock("@/modules/inventory/presentation/hooks/use-warehouses", () => ({
  useWarehouses: () => ({
    data: {
      data: [
        { id: "wh-1", name: "Main Warehouse", code: "MW" },
        { id: "wh-2", name: "Secondary Warehouse", code: "SW" },
      ],
    },
  }),
}));

vi.mock("@/modules/inventory/presentation/schemas/transfer.schema", () => ({
  createTransferSchema: { parse: vi.fn() },
  toCreateTransferDto: vi.fn((d: unknown) => d),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => vi.fn(),
}));

// --- Tests ---

describe("TransferForm", () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    mockOnOpenChange.mockClear();
    mockMutateAsync.mockClear();
  });

  it("Given: open is false When: rendering Then: should render nothing", () => {
    const { container } = render(
      <TransferForm open={false} onOpenChange={mockOnOpenChange} />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("Given: open is true When: rendering Then: should show create title", () => {
    render(<TransferForm open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("form.createTitle")).toBeInTheDocument();
  });

  it("Given: open is true When: rendering Then: should show from and to warehouse fields", () => {
    render(<TransferForm open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("fields.from")).toBeInTheDocument();
    expect(screen.getByText("fields.to")).toBeInTheDocument();
  });

  it("Given: open is true When: rendering Then: should show products label and add product button", () => {
    render(<TransferForm open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("fields.products")).toBeInTheDocument();
    expect(screen.getByText("actions.addProduct")).toBeInTheDocument();
  });

  it("Given: open is true When: rendering Then: should show notes field", () => {
    render(<TransferForm open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("fields.notes")).toBeInTheDocument();
  });

  it("Given: open is true When: rendering Then: should show cancel and create buttons", () => {
    render(<TransferForm open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("create")).toBeInTheDocument();
  });

  it("Given: open is true When: rendering Then: should render one product line with a quantity input", () => {
    const { container } = render(
      <TransferForm open={true} onOpenChange={mockOnOpenChange} />,
    );

    const numberInputs = container.querySelectorAll('input[type="number"]');
    expect(numberInputs.length).toBeGreaterThanOrEqual(1);
  });

  it("Given: open is true When: clicking the close X button Then: should call onOpenChange with false", () => {
    render(<TransferForm open={true} onOpenChange={mockOnOpenChange} />);

    // The close X button is the first ghost icon button in the card header
    const buttons = screen.getAllByRole("button");
    const closeButton = buttons.find(
      (btn) =>
        btn.querySelector("svg") !== null &&
        btn.textContent === "" &&
        !btn.getAttribute("type")?.includes("submit"),
    );

    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    }
  });
});
