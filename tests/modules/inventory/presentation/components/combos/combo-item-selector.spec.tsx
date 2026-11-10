import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Stub ProductSearchSelect so we can click "product" deterministically
vi.mock(
  "@/modules/inventory/presentation/components/shared/product-search-select",
  () => ({
    ProductSearchSelect: ({
      value,
      onValueChange,
      disabled,
    }: {
      value?: string;
      onValueChange?: (v: string) => void;
      disabled?: boolean;
    }) => (
      <button
        type="button"
        data-testid="product-search-select"
        data-value={value ?? ""}
        data-disabled={disabled ? "true" : "false"}
        onClick={() => onValueChange?.("prod-picked")}
      >
        pick-product
      </button>
    ),
  }),
);

// Company store — zustand-like selector
vi.mock("@/modules/companies/infrastructure/store/company.store", () => ({
  useCompanyStore: (
    selector: (state: { selectedCompanyId: string | null }) => unknown,
  ) => selector({ selectedCompanyId: "comp-1" }),
}));

import { ComboItemSelector } from "@/modules/inventory/presentation/components/combos/combo-item-selector";

describe("ComboItemSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("Given: single item When: rendering Then: should show one row with product selector and quantity", () => {
      const onChange = vi.fn();

      render(
        <ComboItemSelector
          items={[{ productId: "p-1", quantity: 2 }]}
          onChange={onChange}
        />,
      );

      expect(screen.getAllByTestId("product-search-select")).toHaveLength(1);
      const quantityInput = screen.getByPlaceholderText("fields.quantity");
      expect((quantityInput as HTMLInputElement).value).toBe("2");
    });

    it("Given: multiple items When: rendering Then: should show one row per item", () => {
      const onChange = vi.fn();

      render(
        <ComboItemSelector
          items={[
            { productId: "p-1", quantity: 1 },
            { productId: "p-2", quantity: 3 },
          ]}
          onChange={onChange}
        />,
      );

      expect(screen.getAllByTestId("product-search-select")).toHaveLength(2);
    });

    it("Given: error prop When: rendering Then: should show error message", () => {
      const onChange = vi.fn();

      render(
        <ComboItemSelector
          items={[{ productId: "p-1", quantity: 1 }]}
          onChange={onChange}
          error="Some error"
        />,
      );

      expect(screen.getByText("Some error")).toBeInTheDocument();
    });

    it("Given: no error When: rendering Then: should NOT show error container", () => {
      const onChange = vi.fn();

      render(
        <ComboItemSelector
          items={[{ productId: "p-1", quantity: 1 }]}
          onChange={onChange}
        />,
      );

      // no error paragraph should be present (we identify by class)
      expect(
        document.querySelector("p.text-destructive"),
      ).not.toBeInTheDocument();
    });
  });

  describe("add row", () => {
    it("Given: single item When: clicking addItem Then: should add a blank row via onChange", () => {
      const onChange = vi.fn();

      render(
        <ComboItemSelector
          items={[{ productId: "p-1", quantity: 1 }]}
          onChange={onChange}
        />,
      );

      fireEvent.click(screen.getByText("form.addItem"));

      expect(onChange).toHaveBeenCalledWith([
        { productId: "p-1", quantity: 1 },
        { productId: "", quantity: 1 },
      ]);
    });
  });

  describe("remove row", () => {
    it("Given: multiple items When: clicking remove on first Then: should remove that row", () => {
      const onChange = vi.fn();

      render(
        <ComboItemSelector
          items={[
            { productId: "p-1", quantity: 1 },
            { productId: "p-2", quantity: 2 },
          ]}
          onChange={onChange}
        />,
      );

      const removeButtons = screen.getAllByRole("button", {
        name: "form.removeItem",
      });
      fireEvent.click(removeButtons[0]);

      expect(onChange).toHaveBeenCalledWith([
        { productId: "p-2", quantity: 2 },
      ]);
    });

    it("Given: single item When: clicking remove Then: should be disabled and not call onChange", () => {
      const onChange = vi.fn();

      render(
        <ComboItemSelector
          items={[{ productId: "p-1", quantity: 1 }]}
          onChange={onChange}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: "form.removeItem",
      });
      expect(removeButton).toBeDisabled();
      fireEvent.click(removeButton);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("product change", () => {
    it("Given: user picks a product When: ProductSearchSelect calls onValueChange Then: should update item.productId", () => {
      const onChange = vi.fn();

      render(
        <ComboItemSelector
          items={[{ productId: "", quantity: 1 }]}
          onChange={onChange}
        />,
      );

      fireEvent.click(screen.getByTestId("product-search-select"));

      expect(onChange).toHaveBeenCalledWith([
        { productId: "prod-picked", quantity: 1 },
      ]);
    });
  });

  describe("quantity change", () => {
    it("Given: user types valid quantity When: change fires Then: should update item.quantity", () => {
      const onChange = vi.fn();

      render(
        <ComboItemSelector
          items={[{ productId: "p-1", quantity: 1 }]}
          onChange={onChange}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText("fields.quantity"), {
        target: { value: "5" },
      });

      expect(onChange).toHaveBeenCalledWith([
        { productId: "p-1", quantity: 5 },
      ]);
    });

    it("Given: user types 0 or negative When: change fires Then: should clamp to 1", () => {
      const onChange = vi.fn();

      render(
        <ComboItemSelector
          items={[{ productId: "p-1", quantity: 2 }]}
          onChange={onChange}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText("fields.quantity"), {
        target: { value: "0" },
      });

      expect(onChange).toHaveBeenCalledWith([
        { productId: "p-1", quantity: 1 },
      ]);
    });

    it("Given: user types non-numeric When: change fires Then: should default to 1", () => {
      const onChange = vi.fn();

      render(
        <ComboItemSelector
          items={[{ productId: "p-1", quantity: 2 }]}
          onChange={onChange}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText("fields.quantity"), {
        target: { value: "abc" },
      });

      expect(onChange).toHaveBeenCalledWith([
        { productId: "p-1", quantity: 1 },
      ]);
    });
  });

  describe("disabled state", () => {
    it("Given: disabled prop When: rendering Then: should disable add button and product selector", () => {
      const onChange = vi.fn();

      render(
        <ComboItemSelector
          items={[{ productId: "p-1", quantity: 1 }]}
          onChange={onChange}
          disabled
        />,
      );

      const productSelect = screen.getByTestId("product-search-select");
      expect(productSelect.getAttribute("data-disabled")).toBe("true");
      expect(screen.getByText("form.addItem").closest("button")).toBeDisabled();
    });
  });
});
