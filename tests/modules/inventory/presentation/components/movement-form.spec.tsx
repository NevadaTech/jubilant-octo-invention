import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MovementForm } from "@/modules/inventory/presentation/components/movements/movement-form";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

const mockMutateAsync = vi.fn();
vi.mock("@/modules/inventory/presentation/hooks/use-movements", () => ({
  useCreateMovement: () => ({
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

vi.mock("@/modules/contacts/presentation/hooks/use-contacts", () => ({
  useContacts: () => ({
    data: {
      data: [
        { id: "sup-1", name: "Supplier A" },
        { id: "sup-2", name: "Supplier B" },
      ],
    },
  }),
}));

vi.mock("@/modules/inventory/presentation/schemas/movement.schema", () => ({
  createMovementSchema: { parse: vi.fn() },
  toCreateMovementDto: vi.fn((d: unknown) => d),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => vi.fn(),
}));

vi.mock("@/ui/components/currency-input", () => ({
  CurrencyInput: ({
    value,
    onChange,
  }: {
    value?: number;
    onChange?: (v: number) => void;
  }) => (
    <input
      data-testid="currency-input"
      type="number"
      defaultValue={value}
      onChange={(e) => onChange?.(Number(e.target.value))}
    />
  ),
}));

// --- Tests ---

describe("MovementForm", () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    mockOnOpenChange.mockClear();
    mockMutateAsync.mockClear();
  });

  it("Given: open is false When: rendering Then: should render nothing", () => {
    const { container } = render(
      <MovementForm open={false} onOpenChange={mockOnOpenChange} />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("Given: open is true When: rendering Then: should show create title", () => {
    render(<MovementForm open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("form.createTitle")).toBeInTheDocument();
  });

  it("Given: open is true When: rendering Then: should show movement info section with type, warehouse, reference, reason, and note fields", () => {
    render(<MovementForm open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("form.movementInfo")).toBeInTheDocument();
    expect(screen.getByText("fields.type")).toBeInTheDocument();
    expect(screen.getByText("fields.warehouse")).toBeInTheDocument();
    expect(screen.getByText("fields.reference")).toBeInTheDocument();
    expect(screen.getByText("fields.reason")).toBeInTheDocument();
    expect(screen.getByText("fields.note")).toBeInTheDocument();
  });

  it("Given: open is true When: rendering Then: should show lines section with add line button", () => {
    render(<MovementForm open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("form.linesSection")).toBeInTheDocument();
    expect(screen.getByText("actions.addLine")).toBeInTheDocument();
  });

  it("Given: open is true When: rendering Then: should show one product line with product, quantity, and unit cost fields", () => {
    render(<MovementForm open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("fields.product")).toBeInTheDocument();
    expect(screen.getByText("fields.quantity")).toBeInTheDocument();
    expect(screen.getByText("fields.unitCost")).toBeInTheDocument();
  });

  it("Given: open is true When: rendering Then: should show cancel and create buttons", () => {
    render(<MovementForm open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("create")).toBeInTheDocument();
  });

  it("Given: open is true When: clicking the close X button Then: should call onOpenChange with false", () => {
    render(<MovementForm open={true} onOpenChange={mockOnOpenChange} />);

    // The X close button is the first ghost icon button
    const buttons = screen.getAllByRole("button");
    const closeButton = buttons.find(
      (btn) =>
        btn.querySelector("svg") !== null &&
        btn.textContent === "" &&
        !btn.textContent?.includes("cancel"),
    );

    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    }
  });
});
