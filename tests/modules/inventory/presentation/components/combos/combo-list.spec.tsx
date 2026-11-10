import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// PermissionGate: always render children (we don't want to test permissions here)
vi.mock("@/shared/presentation/components/permission-gate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/ui/components/table-pagination", () => ({
  TablePagination: () => <div data-testid="table-pagination" />,
}));

// ComboFilters stubbed: just the search input
vi.mock(
  "@/modules/inventory/presentation/components/combos/combo-filters",
  () => ({
    ComboFilters: () => <div data-testid="combo-filters" />,
  }),
);

// ConfirmDeleteDialog stubbed: expose a way to inspect/close it
vi.mock("@/ui/components/confirm-delete-dialog", () => ({
  ConfirmDeleteDialog: ({
    open,
    onConfirm,
  }: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    onConfirm: () => void;
    isLoading?: boolean;
  }) =>
    open ? (
      <div data-testid="confirm-dialog">
        <button onClick={onConfirm}>confirm</button>
      </div>
    ) : null,
}));

// Use-combos mocks
let mockCombosState: {
  data:
    | {
        data: Array<{
          id: string;
          sku: string;
          name: string;
          price: number;
          currency: string;
          isActive: boolean;
          items: Array<unknown>;
          createdAt: string;
        }>;
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }
    | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: { message: string };
};

const mockDeactivateMutate = vi.fn();

vi.mock("@/modules/inventory/presentation/hooks/use-combos", () => ({
  useCombos: () => mockCombosState,
  useDeactivateCombo: () => ({
    mutate: mockDeactivateMutate,
    isPending: false,
  }),
}));

import { ComboList } from "@/modules/inventory/presentation/components/combos/combo-list";

describe("ComboList", () => {
  const combo1 = {
    id: "c-1",
    sku: "C1",
    name: "Combo 1",
    price: 1000,
    currency: "COP",
    isActive: true,
    items: [{ id: "i-1" }, { id: "i-2" }],
    createdAt: "2026-01-01T00:00:00Z",
  };
  const combo2 = {
    id: "c-2",
    sku: "C2",
    name: "Combo 2",
    price: 2000,
    currency: "COP",
    isActive: false,
    items: [{ id: "i-3" }],
    createdAt: "2026-02-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCombosState = {
      data: {
        data: [combo1, combo2],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      },
      isLoading: false,
      isError: false,
    };
  });

  describe("rendering", () => {
    it("Given: combos data When: rendering Then: should show list title", () => {
      render(<ComboList />);
      expect(screen.getByText("list.title")).toBeInTheDocument();
    });

    it("Given: combos data When: rendering Then: should show each combo's name and SKU", () => {
      render(<ComboList />);
      expect(screen.getByText("Combo 1")).toBeInTheDocument();
      expect(screen.getByText("Combo 2")).toBeInTheDocument();
      expect(screen.getByText("C1")).toBeInTheDocument();
      expect(screen.getByText("C2")).toBeInTheDocument();
    });

    it("Given: active combo When: rendering Then: should show active badge", () => {
      render(<ComboList />);
      expect(screen.getByText("status.active")).toBeInTheDocument();
    });

    it("Given: inactive combo When: rendering Then: should show inactive badge", () => {
      render(<ComboList />);
      expect(screen.getByText("status.inactive")).toBeInTheDocument();
    });

    it("Given: combo with items When: rendering Then: should show item count", () => {
      render(<ComboList />);
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("Given: combos data When: rendering Then: should show 'actions.new' button", () => {
      render(<ComboList />);
      expect(screen.getByText("actions.new")).toBeInTheDocument();
    });

    it("Given: active combo (combo1) When: rendering Then: should show deactivate button", () => {
      render(<ComboList />);
      expect(
        screen.getByRole("button", { name: "actions.deactivate" }),
      ).toBeInTheDocument();
    });

    it("Given: inactive combo When: rendering Then: should NOT show deactivate button for that row", () => {
      mockCombosState = {
        data: {
          data: [combo2],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        },
        isLoading: false,
        isError: false,
      };

      render(<ComboList />);

      expect(
        screen.queryByRole("button", { name: "actions.deactivate" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("Given: loading When: rendering Then: should not show combo rows", () => {
      mockCombosState = { data: undefined, isLoading: true, isError: false };

      render(<ComboList />);

      expect(screen.queryByText("Combo 1")).not.toBeInTheDocument();
      expect(screen.getByText("list.title")).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("Given: empty combos When: rendering Then: should show empty state with CTA", () => {
      mockCombosState = {
        data: {
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        },
        isLoading: false,
        isError: false,
      };

      render(<ComboList />);

      expect(screen.getByText("empty.title")).toBeInTheDocument();
      expect(screen.getByText("empty.description")).toBeInTheDocument();
      expect(screen.getAllByText("actions.new").length).toBeGreaterThan(0);
    });
  });

  describe("error state", () => {
    it("Given: error When: rendering Then: should show error message", () => {
      mockCombosState = {
        data: undefined,
        isLoading: false,
        isError: true,
        error: { message: "boom" },
      };

      render(<ComboList />);

      expect(screen.getByText(/error\.loading.*boom/i)).toBeInTheDocument();
    });
  });

  describe("deactivate flow", () => {
    it("Given: active combo When: clicking deactivate Then: should open confirm dialog", () => {
      render(<ComboList />);

      fireEvent.click(
        screen.getByRole("button", { name: "actions.deactivate" }),
      );

      expect(screen.getByText("confirm.deactivate.title")).toBeInTheDocument();
    });

    it("Given: confirm dialog open When: clicking confirm Then: should call deactivateCombo.mutate with id", () => {
      render(<ComboList />);

      fireEvent.click(
        screen.getByRole("button", { name: "actions.deactivate" }),
      );
      const confirmButtons = screen.getAllByRole("button", {
        name: "actions.deactivate",
      });
      fireEvent.click(confirmButtons[confirmButtons.length - 1]);

      expect(mockDeactivateMutate).toHaveBeenCalledWith("c-1");
    });
  });

  describe("pagination", () => {
    it("Given: combos data When: rendering Then: should render TablePagination", () => {
      render(<ComboList />);

      expect(screen.getByTestId("table-pagination")).toBeInTheDocument();
    });
  });
});
