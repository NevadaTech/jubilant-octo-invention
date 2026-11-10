import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "es",
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/shared/presentation/components/permission-gate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/lib/date", () => ({
  formatDate: (iso: string) => `fmt(${iso})`,
}));

vi.mock("@/ui/components/confirm-delete-dialog", () => ({
  ConfirmDeleteDialog: ({
    open,
    onConfirm,
  }: {
    open: boolean;
    onConfirm: () => void;
    onOpenChange: (o: boolean) => void;
  }) =>
    open ? (
      <div data-testid="confirm-dialog">
        <button onClick={onConfirm}>confirm</button>
      </div>
    ) : null,
}));

const mockDeactivateMutate = vi.fn();
let mockDeactivateIsPending = false;

let mockComboState: {
  data:
    | {
        id: string;
        sku: string;
        name: string;
        description: string | null;
        price: number;
        currency: string;
        isActive: boolean;
        items: Array<{
          id: string;
          productName: string;
          productSku: string;
          quantity: number;
        }>;
        createdAt: string;
        updatedAt: string;
      }
    | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: { message: string };
};

let mockAvailabilityState: {
  data:
    | {
        data: Array<{
          sku: string;
          availability: Array<{
            warehouseId: string;
            warehouseName: string;
            available: number;
          }>;
        }>;
      }
    | undefined;
  isLoading: boolean;
};

vi.mock("@/modules/inventory/presentation/hooks/use-combos", () => ({
  useCombo: () => mockComboState,
  useDeactivateCombo: () => ({
    mutate: mockDeactivateMutate,
    isPending: mockDeactivateIsPending,
  }),
  useComboAvailability: () => mockAvailabilityState,
}));

import { ComboDetail } from "@/modules/inventory/presentation/components/combos/combo-detail";

describe("ComboDetail", () => {
  const baseCombo = {
    id: "c-1",
    sku: "C1",
    name: "Combo 1",
    description: "Nice combo",
    price: 1500,
    currency: "COP",
    isActive: true,
    items: [
      {
        id: "i-1",
        productName: "Product A",
        productSku: "SKU-A",
        quantity: 2,
      },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockDeactivateIsPending = false;
    mockComboState = { data: baseCombo, isLoading: false, isError: false };
    mockAvailabilityState = {
      data: {
        data: [
          {
            sku: "C1",
            availability: [
              {
                warehouseId: "w-1",
                warehouseName: "Main",
                available: 5,
              },
            ],
          },
        ],
      },
      isLoading: false,
    };
  });

  describe("loading state", () => {
    it("Given: isLoading When: rendering Then: should show skeleton (no combo name)", () => {
      mockComboState = { data: undefined, isLoading: true, isError: false };

      render(<ComboDetail comboId="c-1" />);

      expect(screen.queryByText("Combo 1")).not.toBeInTheDocument();
    });
  });

  describe("error / not found", () => {
    it("Given: isError with message When: rendering Then: should show error and back link", () => {
      mockComboState = {
        data: undefined,
        isLoading: false,
        isError: true,
        error: { message: "Combo not found" },
      };

      render(<ComboDetail comboId="c-1" />);

      expect(screen.getByText("Combo not found")).toBeInTheDocument();
      expect(screen.getByText("detail.backToList")).toBeInTheDocument();
    });

    it("Given: no data and no error When: rendering Then: should show default not found message", () => {
      mockComboState = { data: undefined, isLoading: false, isError: false };

      render(<ComboDetail comboId="c-1" />);

      expect(screen.getByText("detail.notFound")).toBeInTheDocument();
    });
  });

  describe("rendering with data", () => {
    it("Given: combo exists When: rendering Then: should show name and SKU in header", () => {
      render(<ComboDetail comboId="c-1" />);

      expect(screen.getByText("Combo 1")).toBeInTheDocument();
      expect(screen.getByText("C1")).toBeInTheDocument();
    });

    it("Given: active combo When: rendering Then: should show active badge", () => {
      render(<ComboDetail comboId="c-1" />);

      expect(screen.getByText("status.active")).toBeInTheDocument();
    });

    it("Given: inactive combo When: rendering Then: should show inactive badge", () => {
      mockComboState = {
        data: { ...baseCombo, isActive: false },
        isLoading: false,
        isError: false,
      };

      render(<ComboDetail comboId="c-1" />);

      expect(screen.getByText("status.inactive")).toBeInTheDocument();
    });

    it("Given: description present When: rendering Then: should show description section", () => {
      render(<ComboDetail comboId="c-1" />);

      expect(screen.getByText("detail.description")).toBeInTheDocument();
      expect(screen.getByText("Nice combo")).toBeInTheDocument();
    });

    it("Given: description is null When: rendering Then: should NOT show description section", () => {
      mockComboState = {
        data: { ...baseCombo, description: null },
        isLoading: false,
        isError: false,
      };

      render(<ComboDetail comboId="c-1" />);

      expect(screen.queryByText("detail.description")).not.toBeInTheDocument();
    });

    it("Given: combo with items When: rendering Then: should show item's product name and quantity", () => {
      render(<ComboDetail comboId="c-1" />);

      expect(screen.getByText("Product A")).toBeInTheDocument();
      // quantity 2 should appear
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  describe("actions", () => {
    it("Given: active combo When: clicking deactivate Then: should open confirm dialog", () => {
      render(<ComboDetail comboId="c-1" />);

      fireEvent.click(screen.getByText("actions.deactivate"));

      expect(screen.getByText("confirm.deactivate.title")).toBeInTheDocument();
    });

    it("Given: confirm dialog When: clicking confirm Then: should call deactivateCombo.mutate", () => {
      render(<ComboDetail comboId="c-1" />);

      fireEvent.click(screen.getByText("actions.deactivate"));
      const confirmButtons = screen.getAllByRole("button", {
        name: "actions.deactivate",
      });
      fireEvent.click(confirmButtons[confirmButtons.length - 1]);

      expect(mockDeactivateMutate).toHaveBeenCalledWith("c-1");
    });

    it("Given: inactive combo When: rendering Then: should NOT show deactivate button", () => {
      mockComboState = {
        data: { ...baseCombo, isActive: false },
        isLoading: false,
        isError: false,
      };

      render(<ComboDetail comboId="c-1" />);

      expect(screen.queryByText("actions.deactivate")).not.toBeInTheDocument();
    });

    it("Given: deactivate pending When: rendering Then: should disable the button", () => {
      mockDeactivateIsPending = true;

      render(<ComboDetail comboId="c-1" />);

      const btn = screen.getByText("actions.deactivate").closest("button");
      expect(btn).toBeDisabled();
    });
  });
});
