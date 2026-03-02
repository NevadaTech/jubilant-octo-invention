import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MovementDetail } from "@/modules/inventory/presentation/components/movements/movement-detail";
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
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

const mockPostMutateAsync = vi.fn();
const mockVoidMutateAsync = vi.fn();

let mockMovementHook: {
  data: StockMovement | undefined;
  isLoading: boolean;
  isError: boolean;
};

let mockPostHook: {
  mutateAsync: typeof mockPostMutateAsync;
  isPending: boolean;
};

let mockVoidHook: {
  mutateAsync: typeof mockVoidMutateAsync;
  isPending: boolean;
};

vi.mock("@/modules/inventory/presentation/hooks/use-movements", () => ({
  useMovement: () => mockMovementHook,
  usePostMovement: () => mockPostHook,
  useVoidMovement: () => mockVoidHook,
}));

vi.mock(
  "@/modules/inventory/presentation/components/movements/movement-type-badge",
  () => ({
    MovementTypeBadge: ({ type }: { type: string }) => (
      <span data-testid="movement-type-badge">{type}</span>
    ),
  }),
);

vi.mock(
  "@/modules/inventory/presentation/components/movements/movement-status-badge",
  () => ({
    MovementStatusBadge: ({ status }: { status: string }) => (
      <span data-testid="movement-status-badge">{status}</span>
    ),
  }),
);

vi.mock("@/ui/components/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    asChild,
    ...rest
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    asChild?: boolean;
    variant?: string;
    size?: string;
  }) => {
    if (asChild) return <>{children}</>;
    return (
      <button onClick={onClick} disabled={disabled} {...rest}>
        {children}
      </button>
    );
  },
}));

vi.mock("@/ui/components/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
}));

vi.mock("@/ui/components/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

vi.mock("@/ui/components/alert-dialog", () => ({
  AlertDialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
  }) => (open ? <div data-testid="alert-dialog">{children}</div> : null),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="alert-title">{children}</h2>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogCancel: ({
    children,
    disabled,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
  }) => <button disabled={disabled}>{children}</button>,
  AlertDialogAction: ({
    children,
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="alert-action"
      className={className}
    >
      {children}
    </button>
  ),
}));

// --- Helpers ---

function makeMovementLine(
  overrides: Partial<{
    id: string;
    productName: string;
    productSku: string;
    quantity: number;
    unitCost: number | null;
    currency: string | null;
  }> = {},
): MovementLine {
  return MovementLine.create({
    id: overrides.id ?? "ml-1",
    productId: "p-1",
    productName: overrides.productName ?? "Widget",
    productSku: overrides.productSku ?? "W-001",
    quantity: overrides.quantity ?? 10,
    unitCost: overrides.unitCost !== undefined ? overrides.unitCost : 25.5,
    currency: overrides.currency !== undefined ? overrides.currency : "USD",
  });
}

function makeMovement(
  overrides: Partial<{
    id: string;
    type:
      | "IN"
      | "OUT"
      | "ADJUST_IN"
      | "ADJUST_OUT"
      | "TRANSFER_IN"
      | "TRANSFER_OUT";
    status: "DRAFT" | "POSTED" | "VOID" | "RETURNED";
    warehouseName: string;
    warehouseCode: string | null;
    reference: string | null;
    reason: string | null;
    note: string | null;
    lines: MovementLine[];
    createdByName: string | null;
    postedAt: Date | null;
    postedBy: string | null;
    postedByName: string | null;
    returnedAt: Date | null;
    returnedBy: string | null;
    returnedByName: string | null;
  }> = {},
): StockMovement {
  return StockMovement.create({
    id: overrides.id ?? "mov-1234abcd-xxxx",
    warehouseId: "wh-1",
    warehouseName: overrides.warehouseName ?? "Central Warehouse",
    warehouseCode: overrides.warehouseCode ?? "CW-01",
    type: overrides.type ?? "IN",
    status: overrides.status ?? "DRAFT",
    reference: overrides.reference ?? "REF-001",
    reason: overrides.reason ?? "Restock",
    note: overrides.note ?? null,
    lines: overrides.lines ?? [makeMovementLine()],
    createdBy: "user-1",
    createdByName: overrides.createdByName ?? "Alice",
    createdAt: new Date("2026-02-25T10:00:00Z"),
    postedAt: overrides.postedAt ?? null,
    postedBy: overrides.postedBy ?? null,
    postedByName: overrides.postedByName ?? null,
    returnedAt: overrides.returnedAt ?? null,
    returnedBy: overrides.returnedBy ?? null,
    returnedByName: overrides.returnedByName ?? null,
  });
}

// --- Tests ---

describe("MovementDetail", () => {
  beforeEach(() => {
    mockPostMutateAsync.mockClear();
    mockVoidMutateAsync.mockClear();
    mockMovementHook = {
      data: undefined,
      isLoading: false,
      isError: false,
    };
    mockPostHook = {
      mutateAsync: mockPostMutateAsync,
      isPending: false,
    };
    mockVoidHook = {
      mutateAsync: mockVoidMutateAsync,
      isPending: false,
    };
  });

  it("Given: loading state When: rendering Then: should display skeleton placeholders", () => {
    // Arrange
    mockMovementHook = {
      data: undefined,
      isLoading: true,
      isError: false,
    };

    // Act
    render(<MovementDetail movementId="mov-1" />);

    // Assert
    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });

  it("Given: error state When: rendering Then: should display not found message and back link", () => {
    // Arrange
    mockMovementHook = {
      data: undefined,
      isLoading: false,
      isError: true,
    };

    // Act
    render(<MovementDetail movementId="mov-1" />);

    // Assert
    expect(screen.getByText("detail.notFound")).toBeDefined();
    expect(screen.getByText("detail.notFoundDescription")).toBeDefined();
    const backLink = screen.getByRole("link");
    expect(backLink.getAttribute("href")).toContain("/movements");
  });

  it("Given: DRAFT IN movement loaded When: rendering Then: should display warehouse, type badge, status badge, and action buttons", () => {
    // Arrange
    const movement = makeMovement({
      type: "IN",
      status: "DRAFT",
      warehouseName: "North Depot",
      warehouseCode: "ND-01",
    });
    mockMovementHook = {
      data: movement,
      isLoading: false,
      isError: false,
    };

    // Act
    render(<MovementDetail movementId="mov-1" />);

    // Assert
    expect(screen.getByText("North Depot")).toBeDefined();
    expect(screen.getByText("ND-01")).toBeDefined();
    expect(
      screen.getAllByTestId("movement-type-badge").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByTestId("movement-status-badge").length,
    ).toBeGreaterThanOrEqual(1);
    // DRAFT shows edit + post buttons
    expect(screen.getByText("actions.edit")).toBeDefined();
    expect(screen.getByText("actions.post")).toBeDefined();
  });

  it("Given: POSTED movement When: rendering Then: should show void button and posted info", () => {
    // Arrange
    const movement = makeMovement({
      status: "POSTED",
      postedAt: new Date("2026-02-26T14:00:00Z"),
      postedBy: "user-2",
      postedByName: "Bob Manager",
    });
    mockMovementHook = {
      data: movement,
      isLoading: false,
      isError: false,
    };

    // Act
    render(<MovementDetail movementId="mov-1" />);

    // Assert
    expect(screen.getByText("actions.void")).toBeDefined();
    expect(screen.getByText("Bob Manager")).toBeDefined();
    expect(screen.getByText("fields.postedBy")).toBeDefined();
  });

  it("Given: movement with lines When: rendering Then: should display product table with names, SKUs, quantities, and costs", () => {
    // Arrange
    const lines = [
      makeMovementLine({
        id: "ml-1",
        productName: "Alpha Part",
        productSku: "AP-01",
        quantity: 20,
        unitCost: 15,
      }),
      makeMovementLine({
        id: "ml-2",
        productName: "Beta Part",
        productSku: "BP-02",
        quantity: 5,
        unitCost: 30,
      }),
    ];
    const movement = makeMovement({ lines });
    mockMovementHook = {
      data: movement,
      isLoading: false,
      isError: false,
    };

    // Act
    render(<MovementDetail movementId="mov-1" />);

    // Assert
    expect(screen.getByText("Alpha Part")).toBeDefined();
    expect(screen.getByText("AP-01")).toBeDefined();
    expect(screen.getByText("Beta Part")).toBeDefined();
    expect(screen.getByText("BP-02")).toBeDefined();
    expect(screen.getByText("detail.products")).toBeDefined();
  });

  it("Given: IN movement When: rendering summary Then: should display positive quantity indicator and total items", () => {
    // Arrange
    const movement = makeMovement({
      type: "IN",
      lines: [
        makeMovementLine({ quantity: 10 }),
        makeMovementLine({ id: "ml-2", quantity: 5 }),
      ],
    });
    mockMovementHook = {
      data: movement,
      isLoading: false,
      isError: false,
    };

    // Act
    render(<MovementDetail movementId="mov-1" />);

    // Assert
    expect(screen.getByText("+15")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
  });

  it("Given: DRAFT movement When: clicking post button Then: should open post confirmation dialog", () => {
    // Arrange
    const movement = makeMovement({ status: "DRAFT" });
    mockMovementHook = {
      data: movement,
      isLoading: false,
      isError: false,
    };

    // Act
    render(<MovementDetail movementId="mov-1" />);
    const postBtn = screen.getByText("actions.post");
    fireEvent.click(postBtn);

    // Assert
    expect(screen.getByTestId("alert-dialog")).toBeDefined();
    expect(screen.getByText("confirmPost.title")).toBeDefined();
    expect(screen.getByText("confirmPost.description")).toBeDefined();
  });

  it("Given: movement with note When: rendering Then: should display the note text", () => {
    // Arrange
    const movement = makeMovement({ note: "Urgent delivery" });
    mockMovementHook = {
      data: movement,
      isLoading: false,
      isError: false,
    };

    // Act
    render(<MovementDetail movementId="mov-1" />);

    // Assert
    expect(screen.getByText("Urgent delivery")).toBeDefined();
    expect(screen.getByText("fields.note")).toBeDefined();
  });
});
