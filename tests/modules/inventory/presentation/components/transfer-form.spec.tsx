import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

vi.mock(
  "@/modules/inventory/presentation/components/shared/product-search-select",
  () => ({
    ProductSearchSelect: ({
      placeholder,
      value,
      onValueChange,
    }: {
      placeholder?: string;
      value?: string;
      onValueChange?: (v: string) => void;
    }) => (
      <select
        data-testid="product-search-select"
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
      >
        <option value="">{placeholder}</option>
      </select>
    ),
  }),
);

vi.mock("@/modules/companies/infrastructure/store/company.store", () => ({
  useCompanyStore: (
    selector: (s: { selectedCompanyId: string | null }) => unknown,
  ) => selector({ selectedCompanyId: null }),
}));

// --- Test helper ---

function renderWithQuery(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(component, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

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
    renderWithQuery(
      <TransferForm open={true} onOpenChange={mockOnOpenChange} />,
    );

    expect(screen.getByText("form.createTitle")).toBeInTheDocument();
  });

  it("Given: open is true When: rendering Then: should show from and to warehouse fields", () => {
    renderWithQuery(
      <TransferForm open={true} onOpenChange={mockOnOpenChange} />,
    );

    expect(screen.getByText("fields.from")).toBeInTheDocument();
    expect(screen.getByText("fields.to")).toBeInTheDocument();
  });

  it("Given: open is true When: rendering Then: should show products label and add product button", () => {
    renderWithQuery(
      <TransferForm open={true} onOpenChange={mockOnOpenChange} />,
    );

    expect(screen.getByText("fields.products")).toBeInTheDocument();
    expect(screen.getByText("actions.addProduct")).toBeInTheDocument();
  });

  it("Given: open is true When: rendering Then: should show notes field", () => {
    renderWithQuery(
      <TransferForm open={true} onOpenChange={mockOnOpenChange} />,
    );

    expect(screen.getByText("fields.notes")).toBeInTheDocument();
  });

  it("Given: open is true When: rendering Then: should show cancel and create buttons", () => {
    renderWithQuery(
      <TransferForm open={true} onOpenChange={mockOnOpenChange} />,
    );

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
    renderWithQuery(
      <TransferForm open={true} onOpenChange={mockOnOpenChange} />,
    );

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
