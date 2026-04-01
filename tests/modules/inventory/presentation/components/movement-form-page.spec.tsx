import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MovementFormPage } from "@/modules/inventory/presentation/components/movements/movement-form-page";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

const mockPush = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: () => null,
  }),
}));

let mockMovementData: {
  data: {
    id: string;
    warehouseId: string;
    type: string;
    status: string;
    reference: string | null;
    reason: string | null;
    note: string | null;
    lines: { productId: string; quantity: number; unitCost: number | null }[];
  } | null;
  isLoading: boolean;
};

vi.mock("@/modules/inventory/presentation/hooks/use-movements", () => ({
  useCreateMovement: () => ({
    isPending: false,
    isError: false,
    mutateAsync: vi.fn(),
  }),
  useUpdateMovement: () => ({
    isPending: false,
    isError: false,
    mutateAsync: vi.fn(),
  }),
  useMovement: () => mockMovementData,
}));

vi.mock("@/modules/inventory/presentation/hooks/use-product-search", () => ({
  useProductSearch: () => ({
    products: [
      { id: "p1", name: "Widget A", sku: "WA-001", barcode: "BAR-001" },
      { id: "p2", name: "Widget B", sku: "WB-002", barcode: "BAR-002" },
    ],
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isError: false,
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
  }: {
    value?: number;
    onChange?: (v: number) => void;
  }) => (
    <input data-testid="currency-input" type="number" defaultValue={value} />
  ),
}));

// --- Tests ---

describe("MovementFormPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    mockPush.mockClear();
    mockMovementData = { data: null, isLoading: false };
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderWithProviders = (ui: React.ReactElement) =>
    render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    );

  it("Given: no movementId When: rendering Then: should show create title and description", () => {
    renderWithProviders(<MovementFormPage />);

    expect(screen.getByText("form.createTitle")).toBeInTheDocument();
    expect(screen.getByText("form.createDescription")).toBeInTheDocument();
  });

  it("Given: no movementId When: rendering Then: should show movement info and lines section cards", () => {
    renderWithProviders(<MovementFormPage />);

    expect(screen.getByText("form.movementInfo")).toBeInTheDocument();
    expect(screen.getByText("form.linesSection")).toBeInTheDocument();
  });

  it("Given: no movementId When: rendering Then: should show type, warehouse, reference, reason, and note fields", () => {
    renderWithProviders(<MovementFormPage />);

    expect(
      screen.getByText((content) => content.startsWith("fields.type")),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        (content) =>
          content.startsWith("fields.warehouse") &&
          !content.includes("Placeholder"),
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("fields.reference")).toBeInTheDocument();
    expect(screen.getByText("fields.reason")).toBeInTheDocument();
    expect(screen.getByText("fields.note")).toBeInTheDocument();
  });

  it("Given: no movementId When: rendering Then: should show add line button", () => {
    renderWithProviders(<MovementFormPage />);

    expect(screen.getByText("actions.addLine")).toBeInTheDocument();
  });

  it("Given: no movementId When: rendering Then: should show cancel and create buttons", () => {
    renderWithProviders(<MovementFormPage />);

    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("create")).toBeInTheDocument();
  });

  it("Given: no movementId When: rendering Then: should render one product line by default with product, quantity, and unit cost fields", () => {
    renderWithProviders(<MovementFormPage />);

    expect(
      screen.getByText(
        (content) =>
          content.startsWith("fields.product") &&
          !content.includes("Placeholder"),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.startsWith("fields.quantity")),
    ).toBeInTheDocument();
    expect(screen.getByText("fields.unitCost")).toBeInTheDocument();
  });

  it("Given: movementId with loading state When: rendering Then: should show skeleton placeholders", () => {
    mockMovementData = { data: null, isLoading: true };

    const { container } = renderWithProviders(
      <MovementFormPage movementId="mov-1" />,
    );

    // Skeleton component renders divs with animate-pulse class
    const skeletons = container.querySelectorAll(
      "[class*='h-10'], [class*='h-64'], [class*='h-48']",
    );
    expect(skeletons.length).toBeGreaterThan(0);
    // Should NOT render the form title when loading
    expect(screen.queryByText("form.movementInfo")).not.toBeInTheDocument();
  });

  it("Given: movementId with loaded data When: rendering Then: should show edit title", () => {
    mockMovementData = {
      data: {
        id: "mov-1",
        warehouseId: "wh-1",
        type: "IN",
        status: "DRAFT",
        reference: "REF-001",
        reason: null,
        note: null,
        lines: [{ productId: "p1", quantity: 10, unitCost: 5 }],
      },
      isLoading: false,
    };

    renderWithProviders(<MovementFormPage movementId="mov-1" />);

    expect(screen.getByText("form.editTitle")).toBeInTheDocument();
    expect(screen.getByText("form.editDescription")).toBeInTheDocument();
  });

  it("Given: movementId with loaded data When: rendering Then: should show save button instead of create", () => {
    mockMovementData = {
      data: {
        id: "mov-1",
        warehouseId: "wh-1",
        type: "IN",
        status: "DRAFT",
        reference: null,
        reason: null,
        note: null,
        lines: [{ productId: "p1", quantity: 5, unitCost: null }],
      },
      isLoading: false,
    };

    renderWithProviders(<MovementFormPage movementId="mov-1" />);

    expect(screen.getByText("save")).toBeInTheDocument();
    expect(screen.queryByText("create")).not.toBeInTheDocument();
  });
});
