import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ReorderRuleDialog } from "@/modules/inventory/presentation/components/stock/reorder-rule-dialog";
import type { ReorderRuleApiDto } from "@/modules/inventory/application/dto/reorder-rule.dto";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock("@/ui/components/dialog", () => ({
  Dialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open: boolean;
  }) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="dialog-description">{children}</p>
  ),
  DialogFooter: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="dialog-footer" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("@/ui/components/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    type?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      type={type}
    >
      {children}
    </button>
  ),
}));

vi.mock("@/ui/components/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));

vi.mock("@/ui/components/label", () => ({
  Label: ({
    children,
    htmlFor,
  }: {
    children: React.ReactNode;
    htmlFor?: string;
  }) => <label htmlFor={htmlFor}>{children}</label>,
}));

vi.mock("@/ui/components/form-field", () => ({
  FormField: ({
    children,
    error,
  }: {
    children: React.ReactNode;
    error?: string;
  }) => (
    <div data-testid="form-field">
      {children}
      {error && <span data-testid="field-error">{error}</span>}
    </div>
  ),
}));

const mockCreateMutateAsync = vi.fn().mockResolvedValue({});
const mockUpdateMutateAsync = vi.fn().mockResolvedValue({});
const mockDeleteMutateAsync = vi.fn().mockResolvedValue({});

let mockRulesData: ReorderRuleApiDto[] | undefined = undefined;

vi.mock("@/modules/inventory/presentation/hooks/use-reorder-rules", () => ({
  useReorderRules: () => ({ data: mockRulesData }),
  useCreateReorderRule: () => ({
    isPending: false,
    mutateAsync: mockCreateMutateAsync,
  }),
  useUpdateReorderRule: () => ({
    isPending: false,
    mutateAsync: mockUpdateMutateAsync,
  }),
  useDeleteReorderRule: () => ({
    isPending: false,
    mutateAsync: mockDeleteMutateAsync,
  }),
}));

vi.mock("@/modules/inventory/presentation/schemas/reorder-rule.schema", () => ({
  reorderRuleSchema: {
    // Provide a pass-through zod-like schema for zodResolver
    _def: { typeName: "ZodObject" },
    parse: (data: unknown) => data,
    parseAsync: async (data: unknown) => data,
    safeParse: (data: unknown) => ({ success: true, data }),
    safeParseAsync: async (data: unknown) => ({ success: true, data }),
    spa: async (data: unknown) => ({ success: true, data }),
  },
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => async (values: Record<string, unknown>) => ({
    values,
    errors: {},
  }),
}));

// --- Helpers ---

function makeRule(
  overrides: Partial<ReorderRuleApiDto> = {},
): ReorderRuleApiDto {
  return {
    id: overrides.id ?? "rule-1",
    productId: overrides.productId ?? "prod-1",
    warehouseId: overrides.warehouseId ?? "wh-1",
    minQty: overrides.minQty ?? 10,
    maxQty: overrides.maxQty ?? 100,
    safetyQty: overrides.safetyQty ?? 5,
  };
}

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  productId: "prod-1",
  warehouseId: "wh-1",
  productName: "Widget Alpha",
  warehouseName: "Main Warehouse",
};

// --- Tests ---

describe("ReorderRuleDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRulesData = undefined;
  });

  it("Given: open is false When: rendering Then: should not render the dialog", () => {
    const { container } = render(
      <ReorderRuleDialog {...defaultProps} open={false} />,
    );

    expect(container.querySelector('[data-testid="dialog"]')).toBeNull();
  });

  it("Given: no existing rule When: dialog is open Then: should display create title", () => {
    mockRulesData = [];

    render(<ReorderRuleDialog {...defaultProps} />);

    const title = screen.getByTestId("dialog-title");
    expect(title.textContent).toBe("createTitle");
  });

  it("Given: existing rule matches product and warehouse When: dialog is open Then: should display edit title", () => {
    mockRulesData = [
      makeRule({ productId: "prod-1", warehouseId: "wh-1" }),
    ];

    render(<ReorderRuleDialog {...defaultProps} />);

    const title = screen.getByTestId("dialog-title");
    expect(title.textContent).toBe("editTitle");
  });

  it("Given: dialog is open When: rendering Then: should display product name and warehouse name in description", () => {
    mockRulesData = [];

    render(<ReorderRuleDialog {...defaultProps} />);

    const description = screen.getByTestId("dialog-description");
    expect(description.textContent).toContain("Widget Alpha");
    expect(description.textContent).toContain("Main Warehouse");
  });

  it("Given: dialog is open When: rendering Then: should display form fields for minQty, maxQty, and safetyQty", () => {
    mockRulesData = [];

    render(<ReorderRuleDialog {...defaultProps} />);

    expect(screen.getByText("fields.minQty")).toBeDefined();
    expect(screen.getByText("fields.maxQty")).toBeDefined();
    expect(screen.getByText("fields.safetyQty")).toBeDefined();
    expect(screen.getByLabelText("fields.minQty")).toBeDefined();
    expect(screen.getByLabelText("fields.maxQty")).toBeDefined();
    expect(screen.getByLabelText("fields.safetyQty")).toBeDefined();
  });

  it("Given: existing rule When: rendering Then: should show delete button", () => {
    mockRulesData = [
      makeRule({ productId: "prod-1", warehouseId: "wh-1" }),
    ];

    render(<ReorderRuleDialog {...defaultProps} />);

    const deleteBtn = screen.getByText("delete");
    expect(deleteBtn).toBeDefined();
    expect(deleteBtn.closest("button")?.getAttribute("data-variant")).toBe(
      "destructive",
    );
  });

  it("Given: no existing rule When: rendering Then: should not show delete button and submit shows create label", () => {
    mockRulesData = [];

    render(<ReorderRuleDialog {...defaultProps} />);

    expect(screen.queryByText("delete")).toBeNull();
    expect(screen.getByText("create")).toBeDefined();
  });
});
