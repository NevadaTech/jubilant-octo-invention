import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MovementList } from "@/modules/inventory/presentation/components/movements/movement-list";
import {
  StockMovement,
  MovementLine,
} from "@/modules/inventory/domain/entities/stock-movement.entity";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

let mockQueryState: {
  data:
    | {
        data: StockMovement[];
        pagination: {
          page: number;
          totalPages: number;
          total: number;
          limit: number;
        };
      }
    | undefined;
  isLoading: boolean;
  isError: boolean;
} = { data: undefined, isLoading: false, isError: false };

vi.mock("@/modules/inventory/presentation/hooks/use-movements", () => ({
  useMovements: () => mockQueryState,
  usePostMovement: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useVoidMovement: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useDeleteMovement: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock(
  "@/modules/inventory/presentation/components/movements/movement-type-badge",
  () => ({
    MovementTypeBadge: ({ type }: { type: string }) => (
      <span data-testid="type-badge">{type}</span>
    ),
  }),
);

vi.mock(
  "@/modules/inventory/presentation/components/movements/movement-status-badge",
  () => ({
    MovementStatusBadge: ({ status }: { status: string }) => (
      <span data-testid="status-badge">{status}</span>
    ),
  }),
);

vi.mock(
  "@/modules/inventory/presentation/components/movements/movement-filters",
  () => ({
    MovementFilters: () => <div data-testid="movement-filters" />,
  }),
);

vi.mock(
  "@/modules/inventory/presentation/components/movements/movement-form",
  () => ({
    MovementForm: () => <div data-testid="movement-form" />,
  }),
);

vi.mock("@/ui/components/table-pagination", () => ({
  TablePagination: () => <div data-testid="table-pagination" />,
}));

vi.mock("@/ui/components/sortable-header", () => ({
  SortableHeader: ({ label }: { label: string }) => <th>{label}</th>,
}));

vi.mock("@/modules/companies/infrastructure/store/company.store", () => ({
  useCompanyStore: () => null,
}));

// --- Helpers ---

function makeMovement(
  overrides: Partial<{
    id: string;
    type: "IN" | "OUT";
    status: "DRAFT" | "POSTED";
    warehouseName: string;
    reference: string | null;
  }> = {},
): StockMovement {
  const line = MovementLine.create({
    id: "line-1",
    productId: "p1",
    productName: "Widget A",
    productSku: "WA-001",
    quantity: 10,
    unitCost: 5,
    currency: "USD",
  });

  return StockMovement.create({
    id: overrides.id ?? "mov-1",
    warehouseId: "wh-1",
    warehouseName: overrides.warehouseName ?? "Main Warehouse",
    warehouseCode: "MW",
    type: overrides.type ?? "IN",
    status: overrides.status ?? "DRAFT",
    reference: overrides.reference ?? "REF-001",
    reason: null,
    note: null,
    lines: [line],
    createdBy: "user-1",
    createdByName: "John Doe",
    createdAt: new Date("2026-01-15T10:00:00Z"),
    postedAt: null,
    postedBy: null,
    postedByName: null,
    returnedAt: null,
    returnedBy: null,
    returnedByName: null,
  });
}

// --- Tests ---

describe("MovementList", () => {
  beforeEach(() => {
    mockQueryState = { data: undefined, isLoading: false, isError: false };
  });

  it("Given: data loaded When: rendering Then: should display the list title", () => {
    const mov = makeMovement();
    mockQueryState = {
      data: {
        data: [mov],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };

    render(<MovementList />);

    expect(screen.getByText("list.title")).toBeDefined();
  });

  it("Given: movements exist When: rendering Then: should render warehouse name and reference for each row", () => {
    const mov1 = makeMovement({
      id: "mov-1",
      warehouseName: "Main Warehouse",
      reference: "REF-001",
    });
    const mov2 = makeMovement({
      id: "mov-2",
      warehouseName: "Secondary Warehouse",
      reference: "REF-002",
    });

    mockQueryState = {
      data: {
        data: [mov1, mov2],
        pagination: { page: 1, totalPages: 1, total: 2, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };

    render(<MovementList />);

    expect(screen.getByText("Main Warehouse")).toBeDefined();
    expect(screen.getByText("Secondary Warehouse")).toBeDefined();
    expect(screen.getByText("REF-001")).toBeDefined();
    expect(screen.getByText("REF-002")).toBeDefined();
  });

  it("Given: movements exist When: rendering Then: should render type and status badges for each row", () => {
    const mov = makeMovement({ type: "IN", status: "DRAFT" });
    mockQueryState = {
      data: {
        data: [mov],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };

    render(<MovementList />);

    expect(screen.getByText("IN")).toBeDefined();
    expect(screen.getByText("DRAFT")).toBeDefined();
  });

  it("Given: no movements When: rendering Then: should show empty state", () => {
    mockQueryState = {
      data: {
        data: [],
        pagination: { page: 1, totalPages: 0, total: 0, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };

    render(<MovementList />);

    expect(screen.getByText("empty.title")).toBeDefined();
    expect(screen.getByText("empty.description")).toBeDefined();
  });

  it("Given: loading state When: rendering Then: should show skeleton placeholders", () => {
    mockQueryState = { data: undefined, isLoading: true, isError: false };

    const { container } = render(<MovementList />);

    // Skeleton elements are rendered (5 items)
    const skeletons = container.querySelectorAll(".h-16");
    expect(skeletons.length).toBe(5);
  });

  it("Given: error state When: rendering Then: should show error message", () => {
    mockQueryState = { data: undefined, isLoading: false, isError: true };

    render(<MovementList />);

    expect(screen.getByText("error.loading")).toBeDefined();
  });

  // --- Branch: movement with null reference ---
  it("Given: movement with null reference When: rendering Then: should show dash", () => {
    const mov = makeMovement({ id: "mov-no-ref", reference: null });
    mockQueryState = {
      data: {
        data: [mov],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };

    render(<MovementList />);
    // No reference should render a dash span
    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBeGreaterThan(0);
  });

  // --- Branch: movement with string reference ---
  it("Given: movement with reference When: rendering Then: should show reference text", () => {
    const mov = makeMovement({ id: "mov-ref", reference: "PO-123" });
    mockQueryState = {
      data: {
        data: [mov],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };

    render(<MovementList />);
    expect(screen.getByText("PO-123")).toBeDefined();
  });

  // --- Branch: isDraft true ---
  it("Given: movement is DRAFT When: checking isDraft Then: should be true", () => {
    const mov = makeMovement({ id: "mov-draft", status: "DRAFT" });
    expect(mov.isDraft).toBe(true);

    mockQueryState = {
      data: {
        data: [mov],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };

    render(<MovementList />);
    // Renders the movement row for draft
    expect(screen.getByText("DRAFT")).toBeDefined();
  });

  // --- Branch: isDraft false ---
  it("Given: movement is POSTED When: checking isDraft Then: should be false", () => {
    const mov = makeMovement({ id: "mov-posted", status: "POSTED" });
    expect(mov.isDraft).toBe(false);

    mockQueryState = {
      data: {
        data: [mov],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };

    render(<MovementList />);
    expect(screen.getByText("POSTED")).toBeDefined();
  });

  // --- Branch: postedAt null vs defined ---
  it("Given: movement with postedAt null When: rendering Then: should show dash for posted date", () => {
    const mov = makeMovement({ id: "mov-no-post" });
    // The makeMovement has postedAt: null by default
    mockQueryState = {
      data: {
        data: [mov],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };

    render(<MovementList />);
    // Multiple dashes may appear (reference, contactName, postedAt)
    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  // --- Branch: movement type OUT (isEntry = false) ---
  it("Given: OUT movement When: rendering Then: should show minus sign", () => {
    const mov = makeMovement({ id: "mov-out", type: "OUT" });
    mockQueryState = {
      data: {
        data: [mov],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };

    render(<MovementList />);
    // The "-10" text (negative quantity) should be visible
    const negativeSpans = document.querySelectorAll(".text-red-600");
    expect(negativeSpans.length).toBeGreaterThan(0);
  });

  // --- Branch: movement type IN (isEntry = true) ---
  it("Given: IN movement When: rendering Then: should show plus sign", () => {
    const mov = makeMovement({ id: "mov-in", type: "IN" });
    mockQueryState = {
      data: {
        data: [mov],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };

    render(<MovementList />);
    const positiveSpans = document.querySelectorAll(".text-green-600");
    expect(positiveSpans.length).toBeGreaterThan(0);
  });
});
