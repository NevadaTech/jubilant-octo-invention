import { describe, it, expect, beforeEach } from "vitest";
import { useInventoryStore } from "@/modules/inventory/infrastructure/store/inventory.store";

const { getState, setState } = useInventoryStore;

function resetStore(): void {
  // Clear any persisted state
  window.localStorage.removeItem("nevada-inventory-store");
  // Reset in-memory state
  setState({
    selectedWarehouseId: null,
    selectedProductId: null,
    productFilters: { page: 1, limit: 10 },
    warehouseFilters: { page: 1, limit: 10 },
    stockFilters: { page: 1, limit: 10 },
    categoryFilters: { page: 1, limit: 10 },
    isProductFormOpen: false,
    isWarehouseFormOpen: false,
    isCategoryFormOpen: false,
    editingProductId: null,
    editingWarehouseId: null,
    editingCategoryId: null,
  });
}

describe("useInventoryStore", () => {
  beforeEach(() => {
    resetStore();
  });

  describe("setSelectedWarehouse", () => {
    it("Given: initial null warehouse When: setting a warehouse id Then: should update selectedWarehouseId", () => {
      getState().setSelectedWarehouse("wh-1");
      expect(getState().selectedWarehouseId).toBe("wh-1");
    });

    it("Given: a selected warehouse When: clearing selection with null Then: should reset to null", () => {
      getState().setSelectedWarehouse("wh-1");
      getState().setSelectedWarehouse(null);
      expect(getState().selectedWarehouseId).toBeNull();
    });
  });

  describe("setSelectedProduct", () => {
    it("Given: initial null product When: setting a product id Then: should update selectedProductId", () => {
      getState().setSelectedProduct("prod-1");
      expect(getState().selectedProductId).toBe("prod-1");
    });

    it("Given: a selected product When: clearing selection with null Then: should reset to null", () => {
      getState().setSelectedProduct("prod-1");
      getState().setSelectedProduct(null);
      expect(getState().selectedProductId).toBeNull();
    });
  });

  describe("setProductFilters", () => {
    it("Given: default product filters When: setting a search term Then: should merge with existing filters", () => {
      getState().setProductFilters({ search: "widget" });
      expect(getState().productFilters).toEqual({
        page: 1,
        limit: 10,
        search: "widget",
      });
    });

    it("Given: existing product filters When: setting page Then: should only update page", () => {
      getState().setProductFilters({ search: "widget" });
      getState().setProductFilters({ page: 2 });
      expect(getState().productFilters).toEqual({
        page: 2,
        limit: 10,
        search: "widget",
      });
    });
  });

  describe("setWarehouseFilters", () => {
    it("Given: default warehouse filters When: setting limit Then: should merge", () => {
      getState().setWarehouseFilters({ limit: 25 });
      expect(getState().warehouseFilters).toEqual({ page: 1, limit: 25 });
    });
  });

  describe("setStockFilters", () => {
    it("Given: default stock filters When: setting page Then: should merge", () => {
      getState().setStockFilters({ page: 3 });
      expect(getState().stockFilters).toEqual({ page: 3, limit: 10 });
    });
  });

  describe("setCategoryFilters", () => {
    it("Given: default category filters When: setting limit Then: should merge", () => {
      getState().setCategoryFilters({ limit: 50 });
      expect(getState().categoryFilters).toEqual({ page: 1, limit: 50 });
    });
  });

  describe("resetProductFilters", () => {
    it("Given: modified product filters When: resetting Then: should restore defaults", () => {
      getState().setProductFilters({ page: 5, search: "widget", limit: 50 });
      getState().resetProductFilters();
      expect(getState().productFilters).toEqual({ page: 1, limit: 10 });
    });
  });

  describe("resetWarehouseFilters", () => {
    it("Given: modified warehouse filters When: resetting Then: should restore defaults", () => {
      getState().setWarehouseFilters({ page: 3, limit: 25 });
      getState().resetWarehouseFilters();
      expect(getState().warehouseFilters).toEqual({ page: 1, limit: 10 });
    });
  });

  describe("resetStockFilters", () => {
    it("Given: modified stock filters When: resetting Then: should restore defaults", () => {
      getState().setStockFilters({ page: 7, limit: 100 });
      getState().resetStockFilters();
      expect(getState().stockFilters).toEqual({ page: 1, limit: 10 });
    });
  });

  describe("resetCategoryFilters", () => {
    it("Given: modified category filters When: resetting Then: should restore defaults", () => {
      getState().setCategoryFilters({ page: 2, limit: 20 });
      getState().resetCategoryFilters();
      expect(getState().categoryFilters).toEqual({ page: 1, limit: 10 });
    });
  });

  describe("resetAllFilters", () => {
    it("Given: all filters modified When: resetting all Then: should restore all to defaults", () => {
      getState().setProductFilters({ page: 2, search: "x" });
      getState().setWarehouseFilters({ page: 3 });
      getState().setStockFilters({ page: 4 });
      getState().setCategoryFilters({ page: 5 });
      getState().resetAllFilters();
      expect(getState().productFilters).toEqual({ page: 1, limit: 10 });
      expect(getState().warehouseFilters).toEqual({ page: 1, limit: 10 });
      expect(getState().stockFilters).toEqual({ page: 1, limit: 10 });
      expect(getState().categoryFilters).toEqual({ page: 1, limit: 10 });
    });
  });

  describe("openProductForm", () => {
    it("Given: form is closed When: opening for create Then: should open with no editing id", () => {
      getState().openProductForm();
      expect(getState().isProductFormOpen).toBe(true);
      expect(getState().editingProductId).toBeNull();
    });

    it("Given: form is closed When: opening for edit Then: should open with the product id", () => {
      getState().openProductForm("prod-42");
      expect(getState().isProductFormOpen).toBe(true);
      expect(getState().editingProductId).toBe("prod-42");
    });
  });

  describe("closeProductForm", () => {
    it("Given: form is open for editing When: closing Then: should close and clear editing id", () => {
      getState().openProductForm("prod-42");
      getState().closeProductForm();
      expect(getState().isProductFormOpen).toBe(false);
      expect(getState().editingProductId).toBeNull();
    });
  });

  describe("openWarehouseForm", () => {
    it("Given: form is closed When: opening for create Then: should open with no editing id", () => {
      getState().openWarehouseForm();
      expect(getState().isWarehouseFormOpen).toBe(true);
      expect(getState().editingWarehouseId).toBeNull();
    });

    it("Given: form is closed When: opening for edit Then: should open with the warehouse id", () => {
      getState().openWarehouseForm("wh-7");
      expect(getState().isWarehouseFormOpen).toBe(true);
      expect(getState().editingWarehouseId).toBe("wh-7");
    });
  });

  describe("closeWarehouseForm", () => {
    it("Given: form is open for editing When: closing Then: should close and clear editing id", () => {
      getState().openWarehouseForm("wh-7");
      getState().closeWarehouseForm();
      expect(getState().isWarehouseFormOpen).toBe(false);
      expect(getState().editingWarehouseId).toBeNull();
    });
  });

  describe("openCategoryForm", () => {
    it("Given: form is closed When: opening for create Then: should open with no editing id", () => {
      getState().openCategoryForm();
      expect(getState().isCategoryFormOpen).toBe(true);
      expect(getState().editingCategoryId).toBeNull();
    });

    it("Given: form is closed When: opening for edit Then: should open with the category id", () => {
      getState().openCategoryForm("cat-3");
      expect(getState().isCategoryFormOpen).toBe(true);
      expect(getState().editingCategoryId).toBe("cat-3");
    });
  });

  describe("closeCategoryForm", () => {
    it("Given: form is open for editing When: closing Then: should close and clear editing id", () => {
      getState().openCategoryForm("cat-3");
      getState().closeCategoryForm();
      expect(getState().isCategoryFormOpen).toBe(false);
      expect(getState().editingCategoryId).toBeNull();
    });
  });

  describe("initial state", () => {
    it("Given: a fresh store When: reading state Then: should have correct defaults", () => {
      const state = getState();
      expect(state.selectedWarehouseId).toBeNull();
      expect(state.selectedProductId).toBeNull();
      expect(state.productFilters).toEqual({ page: 1, limit: 10 });
      expect(state.warehouseFilters).toEqual({ page: 1, limit: 10 });
      expect(state.stockFilters).toEqual({ page: 1, limit: 10 });
      expect(state.categoryFilters).toEqual({ page: 1, limit: 10 });
      expect(state.isProductFormOpen).toBe(false);
      expect(state.isWarehouseFormOpen).toBe(false);
      expect(state.isCategoryFormOpen).toBe(false);
      expect(state.editingProductId).toBeNull();
      expect(state.editingWarehouseId).toBeNull();
      expect(state.editingCategoryId).toBeNull();
    });
  });
});
