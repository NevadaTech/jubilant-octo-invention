import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MovementList } from "@/modules/inventory/presentation/components/movements/movement-list";
import {
  StockMovement,
  MovementLine,
} from "@/modules/inventory/domain/entities/stock-movement.entity";

// --- Mocks ---

vi.mock("next-intl", () => ({
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
});
