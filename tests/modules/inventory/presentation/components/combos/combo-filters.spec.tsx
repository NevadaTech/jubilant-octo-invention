import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Debounce — bypass timing in tests (identity)
vi.mock("@/shared/presentation/hooks", () => ({
  useDebounce: <T,>(value: T) => value,
}));

import { ComboFilters } from "@/modules/inventory/presentation/components/combos/combo-filters";

describe("ComboFilters", () => {
  const defaultFilters = { page: 1, limit: 10 };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("Given: default filters When: rendering Then: should show name, sku and status without a click", () => {
      const onFiltersChange = vi.fn();

      render(
        <ComboFilters
          filters={defaultFilters}
          onFiltersChange={onFiltersChange}
        />,
      );

      expect(
        screen.getByPlaceholderText("search.namePlaceholder"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("search.skuPlaceholder"),
      ).toBeInTheDocument();
      expect(screen.getByText("fields.status")).toBeInTheDocument();
      expect(screen.queryByText("filter")).not.toBeInTheDocument();
    });
  });

  describe("name search (debounced)", () => {
    it("Given: user types in name When: change fires Then: should call onFiltersChange with name and page=1", () => {
      const onFiltersChange = vi.fn();

      render(
        <ComboFilters
          filters={defaultFilters}
          onFiltersChange={onFiltersChange}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText("search.namePlaceholder"), {
        target: { value: "Starter" },
      });

      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Starter", page: 1 }),
      );
    });

    it("Given: user clears name When: change fires Then: should call onFiltersChange with name undefined", () => {
      const onFiltersChange = vi.fn();

      render(
        <ComboFilters
          filters={{ ...defaultFilters, name: "Starter" }}
          onFiltersChange={onFiltersChange}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText("search.namePlaceholder"), {
        target: { value: "" },
      });

      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ name: undefined, page: 1 }),
      );
    });

    it("Given: name value unchanged When: component mounts Then: should not call onFiltersChange", () => {
      const onFiltersChange = vi.fn();

      render(
        <ComboFilters
          filters={{ ...defaultFilters, name: "Starter" }}
          onFiltersChange={onFiltersChange}
        />,
      );

      expect(onFiltersChange).not.toHaveBeenCalled();
    });
  });

  describe("sku search (debounced)", () => {
    it("Given: sku field visible When: user types SKU Then: should call onFiltersChange with sku", () => {
      const onFiltersChange = vi.fn();

      render(
        <ComboFilters
          filters={defaultFilters}
          onFiltersChange={onFiltersChange}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText("search.skuPlaceholder"), {
        target: { value: "COMBO" },
      });

      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ sku: "COMBO", page: 1 }),
      );
    });
  });

  describe("status change", () => {
    it("Given: status select visible When: choosing active Then: should call onFiltersChange with isActive true", () => {
      const onFiltersChange = vi.fn();

      render(
        <ComboFilters
          filters={defaultFilters}
          onFiltersChange={onFiltersChange}
        />,
      );

      fireEvent.click(screen.getByRole("combobox"));
      fireEvent.click(screen.getByRole("option", { name: "status.active" }));

      expect(onFiltersChange).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        isActive: true,
      });
    });
  });

  describe("clear filters", () => {
    it("Given: active filters When: clearing name Then: should reset name and page while keeping the rest", () => {
      const onFiltersChange = vi.fn();

      render(
        <ComboFilters
          filters={{
            page: 3,
            limit: 25,
            isActive: true,
            name: "Starter",
            sku: "SKU",
          }}
          onFiltersChange={onFiltersChange}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText("search.namePlaceholder"), {
        target: { value: "" },
      });

      expect(onFiltersChange).toHaveBeenCalledWith({
        page: 1,
        limit: 25,
        isActive: true,
        name: undefined,
        sku: "SKU",
      });
    });

    it("Given: active filters When: clearing sku Then: should reset sku and page while keeping the rest", () => {
      const onFiltersChange = vi.fn();

      render(
        <ComboFilters
          filters={{
            page: 3,
            limit: 25,
            isActive: true,
            name: "Starter",
            sku: "SKU",
          }}
          onFiltersChange={onFiltersChange}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText("search.skuPlaceholder"), {
        target: { value: "" },
      });

      expect(onFiltersChange).toHaveBeenCalledWith({
        page: 1,
        limit: 25,
        isActive: true,
        name: "Starter",
        sku: undefined,
      });
    });

    it("Given: active status When: choosing all statuses Then: should reset isActive", () => {
      const onFiltersChange = vi.fn();

      render(
        <ComboFilters
          filters={{ ...defaultFilters, isActive: true }}
          onFiltersChange={onFiltersChange}
        />,
      );

      fireEvent.click(screen.getByRole("combobox"));
      fireEvent.click(
        screen.getByRole("option", { name: "filters.allStatuses" }),
      );

      expect(onFiltersChange).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        isActive: undefined,
      });
    });
  });
});
