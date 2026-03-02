import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductDetail } from "@/modules/inventory/presentation/components/products/product-detail";
import { Product } from "@/modules/inventory/domain/entities/product.entity";

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

const mockToggleMutate = vi.fn();

let mockProductHook: {
  data: Product | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

let mockToggleHook: {
  mutate: typeof mockToggleMutate;
  isPending: boolean;
};

vi.mock("@/modules/inventory/presentation/hooks/use-products", () => ({
  useProduct: () => mockProductHook,
  useToggleProductStatus: () => mockToggleHook,
}));

vi.mock("@/modules/inventory/presentation/hooks/use-reorder-rules", () => ({
  useReorderRules: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/modules/inventory/presentation/hooks/use-warehouses", () => ({
  useWarehouses: () => ({ data: { data: [] } }),
}));

vi.mock(
  "@/modules/inventory/presentation/components/stock/reorder-rule-dialog",
  () => ({
    ReorderRuleDialog: () => <div data-testid="reorder-rule-dialog" />,
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
    className?: string;
  }) => {
    if (asChild) {
      return <>{children}</>;
    }
    return (
      <button onClick={onClick} disabled={disabled} {...rest}>
        {children}
      </button>
    );
  },
}));

vi.mock("@/ui/components/card", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
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
  CardHeader: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <h3 data-testid="card-title" className={className}>
      {children}
    </h3>
  ),
}));

vi.mock("@/ui/components/badge", () => ({
  Badge: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant?: string;
  }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
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
    <h2 data-testid="alert-dialog-title">{children}</h2>
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
  }) => (
    <button disabled={disabled} data-testid="alert-cancel">
      {children}
    </button>
  ),
  AlertDialogAction: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled} data-testid="alert-action">
      {children}
    </button>
  ),
}));

vi.mock("@/ui/components/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <div onClick={onClick}>{children}</div>,
}));

// --- Helpers ---

function makeProduct(
  overrides: Partial<{
    id: string;
    name: string;
    sku: string;
    description: string | null;
    isActive: boolean;
    price: number;
    categories: { id: string; name: string }[];
    margin: number;
    averageCost: number;
    profit: number;
    totalStock: number;
    unitOfMeasure: string;
    statusChangedBy: string | null;
    statusChangedAt: string | null;
    daysOfStock: number | null;
    turnoverRate: number;
    lastMovementDate: string | null;
  }> = {},
): Product {
  return Product.create({
    id: overrides.id ?? "prod-1",
    sku: overrides.sku ?? "SKU-001",
    name: overrides.name ?? "Test Widget",
    description: overrides.description ?? "A test product",
    categories: overrides.categories ?? [{ id: "cat-1", name: "Electronics" }],
    unitOfMeasure: overrides.unitOfMeasure ?? "UNIT",
    cost: 50,
    price: overrides.price ?? 100,
    minStock: 10,
    maxStock: 500,
    isActive: overrides.isActive ?? true,
    imageUrl: null,
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-02-20"),
    averageCost: overrides.averageCost ?? 45,
    totalStock: overrides.totalStock ?? 250,
    margin: overrides.margin ?? 55,
    profit: overrides.profit ?? 55,
    safetyStock: 20,
    totalIn30d: 100,
    totalOut30d: 80,
    avgDailyConsumption: 3,
    daysOfStock: overrides.daysOfStock ?? 83,
    turnoverRate: overrides.turnoverRate ?? 4.4,
    lastMovementDate: overrides.lastMovementDate ?? "2026-02-19",
    statusChangedBy: overrides.statusChangedBy ?? null,
    statusChangedAt: overrides.statusChangedAt ?? null,
  });
}

// --- Tests ---

describe("ProductDetail", () => {
  beforeEach(() => {
    mockToggleMutate.mockClear();
    mockProductHook = {
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    };
    mockToggleHook = {
      mutate: mockToggleMutate,
      isPending: false,
    };
  });

  it("Given: loading state When: rendering Then: should display skeleton placeholders", () => {
    // Arrange
    mockProductHook = {
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    };

    // Act
    render(<ProductDetail productId="prod-1" />);

    // Assert - skeleton has animate-pulse elements
    const cardContent = screen.getByTestId("card-content");
    expect(cardContent).toBeDefined();
    const pulsingElements = cardContent.querySelectorAll(".animate-pulse");
    expect(pulsingElements.length).toBeGreaterThan(0);
  });

  it("Given: error state When: rendering Then: should display error message and back link", () => {
    // Arrange
    mockProductHook = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Product not found"),
    };

    // Act
    render(<ProductDetail productId="prod-1" />);

    // Assert
    expect(screen.getByText("Product not found")).toBeDefined();
    expect(screen.getByText("detail.backToList")).toBeDefined();
    const backLink = screen.getByRole("link", { name: /detail.backToList/ });
    expect(backLink.getAttribute("href")).toContain("/products");
  });

  it("Given: error state without error message When: rendering Then: should display notFound fallback", () => {
    // Arrange
    mockProductHook = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: null,
    };

    // Act
    render(<ProductDetail productId="prod-1" />);

    // Assert
    expect(screen.getByText("detail.notFound")).toBeDefined();
  });

  it("Given: product loaded (active) When: rendering Then: should display product name, SKU, price, and active badge", () => {
    // Arrange
    const product = makeProduct({
      name: "Premium Widget",
      sku: "PW-100",
      price: 199.99,
      isActive: true,
    });
    mockProductHook = {
      data: product,
      isLoading: false,
      isError: false,
      error: null,
    };

    // Act
    render(<ProductDetail productId="prod-1" />);

    // Assert
    expect(screen.getByText("Premium Widget")).toBeDefined();
    expect(screen.getByText("PW-100")).toBeDefined();
    // Price formatted as currency
    expect(screen.getByText("$199.99")).toBeDefined();
    // Active badge
    const badges = screen.getAllByTestId("badge");
    const activeBadge = badges.find((b) => b.textContent === "status.active");
    expect(activeBadge).toBeDefined();
    expect(activeBadge?.getAttribute("data-variant")).toBe("success");
  });

  it("Given: inactive product with statusChangedBy When: rendering Then: should show status info card", () => {
    // Arrange
    const product = makeProduct({
      isActive: false,
      statusChangedBy: "John Admin",
      statusChangedAt: "2026-02-18T10:00:00Z",
    });
    mockProductHook = {
      data: product,
      isLoading: false,
      isError: false,
      error: null,
    };

    // Act
    render(<ProductDetail productId="prod-1" />);

    // Assert
    expect(screen.getByText("detail.statusInfo")).toBeDefined();
    expect(screen.getByText("John Admin")).toBeDefined();
    expect(screen.getByText("detail.statusChangedBy")).toBeDefined();
    expect(screen.getByText("detail.statusChangedAt")).toBeDefined();
    // Inactive badge
    const badges = screen.getAllByTestId("badge");
    const inactiveBadge = badges.find(
      (b) => b.textContent === "status.inactive",
    );
    expect(inactiveBadge).toBeDefined();
    expect(inactiveBadge?.getAttribute("data-variant")).toBe("secondary");
  });

  it("Given: product with categories When: rendering Then: should render category badges", () => {
    // Arrange
    const product = makeProduct({
      categories: [
        { id: "c1", name: "Hardware" },
        { id: "c2", name: "Networking" },
      ],
    });
    mockProductHook = {
      data: product,
      isLoading: false,
      isError: false,
      error: null,
    };

    // Act
    render(<ProductDetail productId="prod-1" />);

    // Assert
    const badges = screen.getAllByTestId("badge");
    const categoryBadges = badges.filter(
      (b) => b.textContent === "Hardware" || b.textContent === "Networking",
    );
    expect(categoryBadges.length).toBe(2);
  });

  it("Given: product with description When: rendering Then: should display description card", () => {
    // Arrange
    const product = makeProduct({ description: "Top quality widget" });
    mockProductHook = {
      data: product,
      isLoading: false,
      isError: false,
      error: null,
    };

    // Act
    render(<ProductDetail productId="prod-1" />);

    // Assert
    expect(screen.getByText("detail.description")).toBeDefined();
    expect(screen.getByText("Top quality widget")).toBeDefined();
  });

  it("Given: active product When: clicking toggle button Then: should open confirmation dialog", () => {
    // Arrange
    const product = makeProduct({ isActive: true });
    mockProductHook = {
      data: product,
      isLoading: false,
      isError: false,
      error: null,
    };

    // Act
    render(<ProductDetail productId="prod-1" />);

    // Click the deactivate toggle button
    const toggleBtn = screen.getByText("actions.deactivate");
    fireEvent.click(toggleBtn);

    // Assert - dialog should appear
    expect(screen.getByTestId("alert-dialog")).toBeDefined();
    expect(screen.getByText("confirm.deactivate.title")).toBeDefined();
    expect(screen.getByText("confirm.deactivate.description")).toBeDefined();
  });

  it("Given: product with rotation metrics When: rendering Then: should display rotation card values", () => {
    // Arrange
    const product = makeProduct({
      daysOfStock: 42,
      turnoverRate: 8.5,
      lastMovementDate: "2026-02-19",
    });
    mockProductHook = {
      data: product,
      isLoading: false,
      isError: false,
      error: null,
    };

    // Act
    render(<ProductDetail productId="prod-1" />);

    // Assert
    expect(screen.getByText("detail.rotation")).toBeDefined();
    expect(screen.getByText("detail.totalIn30d")).toBeDefined();
    expect(screen.getByText("detail.totalOut30d")).toBeDefined();
    expect(screen.getByText('detail.daysUnit:{"days":42}')).toBeDefined();
    expect(screen.getByText('detail.timesPerYear:{"rate":8.5}')).toBeDefined();
  });
});
