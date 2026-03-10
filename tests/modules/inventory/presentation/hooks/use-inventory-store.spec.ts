import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInventoryStore } from "@/modules/inventory/infrastructure/store/inventory.store";
import {
  useProductFilters,
  useSetProductFilters,
  useResetProductFilters,
  useWarehouseFilters,
  useSetWarehouseFilters,
  useResetWarehouseFilters,
  useStockFilters,
  useSetStockFilters,
  useResetStockFilters,
  useSelectedWarehouseId,
  useSetSelectedWarehouse,
  useProductFormState,
  useWarehouseFormState,
  useCategoryFilters,
  useSetCategoryFilters,
  useResetCategoryFilters,
  useCategoryFormState,
} from "@/modules/inventory/presentation/hooks/use-inventory-store";

describe("Inventory Store & Selector Hooks", () => {
  beforeEach(() => {
    // Reset the store to defaults before each test
    const store = useInventoryStore.getState();
    store.resetAllFilters();
    store.setSelectedWarehouse(null);
    store.setSelectedProduct(null);
    store.closeProductForm();
    store.closeWarehouseForm();
    store.closeCategoryForm();
  });

  // --- Product Filters ---

  it("Given: default state When: useProductFilters Then: should return default filters", () => {
    const { result } = renderHook(() => useProductFilters());
    expect(result.current).toEqual({ page: 1, limit: 10 });
  });

  it("Given: setProductFilters called When: useProductFilters Then: should return updated filters", () => {
    const { result: setter } = renderHook(() => useSetProductFilters());
    const { result: getter } = renderHook(() => useProductFilters());

    act(() => {
      setter.current({ page: 2, limit: 20 });
    });

    expect(getter.current).toEqual({ page: 2, limit: 20 });
  });

  it("Given: filters modified When: resetProductFilters Then: should return default filters", () => {
    const { result: setter } = renderHook(() => useSetProductFilters());
    const { result: resetter } = renderHook(() => useResetProductFilters());
    const { result: getter } = renderHook(() => useProductFilters());

    act(() => {
      setter.current({ page: 5, limit: 50 });
    });
    expect(getter.current.page).toBe(5);

    act(() => {
      resetter.current();
    });
    expect(getter.current).toEqual({ page: 1, limit: 10 });
  });

  // --- Warehouse Filters ---

  it("Given: default state When: useWarehouseFilters Then: should return default filters", () => {
    const { result } = renderHook(() => useWarehouseFilters());
    expect(result.current).toEqual({ page: 1, limit: 10 });
  });

  it("Given: setWarehouseFilters called When: useWarehouseFilters Then: should return updated filters", () => {
    const { result: setter } = renderHook(() => useSetWarehouseFilters());
    const { result: getter } = renderHook(() => useWarehouseFilters());

    act(() => {
      setter.current({ page: 3 });
    });

    expect(getter.current.page).toBe(3);
  });

  it("Given: filters modified When: resetWarehouseFilters Then: should return default", () => {
    const { result: setter } = renderHook(() => useSetWarehouseFilters());
    const { result: resetter } = renderHook(() => useResetWarehouseFilters());
    const { result: getter } = renderHook(() => useWarehouseFilters());

    act(() => {
      setter.current({ page: 7 });
    });

    act(() => {
      resetter.current();
    });

    expect(getter.current).toEqual({ page: 1, limit: 10 });
  });

  // --- Stock Filters ---

  it("Given: default state When: useStockFilters Then: should return default filters", () => {
    const { result } = renderHook(() => useStockFilters());
    expect(result.current).toEqual({ page: 1, limit: 10 });
  });

  it("Given: setStockFilters called When: useStockFilters Then: should return updated filters", () => {
    const { result: setter } = renderHook(() => useSetStockFilters());
    const { result: getter } = renderHook(() => useStockFilters());

    act(() => {
      setter.current({ page: 2 });
    });

    expect(getter.current.page).toBe(2);
  });

  it("Given: filters modified When: resetStockFilters Then: should return default", () => {
    const { result: setter } = renderHook(() => useSetStockFilters());
    const { result: resetter } = renderHook(() => useResetStockFilters());
    const { result: getter } = renderHook(() => useStockFilters());

    act(() => {
      setter.current({ page: 4 });
    });

    act(() => {
      resetter.current();
    });

    expect(getter.current).toEqual({ page: 1, limit: 10 });
  });

  // --- Category Filters ---

  it("Given: default state When: useCategoryFilters Then: should return default filters", () => {
    const { result } = renderHook(() => useCategoryFilters());
    expect(result.current).toEqual({ page: 1, limit: 10 });
  });

  it("Given: setCategoryFilters called When: useCategoryFilters Then: should return updated filters", () => {
    const { result: setter } = renderHook(() => useSetCategoryFilters());
    const { result: getter } = renderHook(() => useCategoryFilters());

    act(() => {
      setter.current({ page: 3, limit: 25 });
    });

    expect(getter.current).toEqual({ page: 3, limit: 25 });
  });

  it("Given: filters modified When: resetCategoryFilters Then: should return default", () => {
    const { result: setter } = renderHook(() => useSetCategoryFilters());
    const { result: resetter } = renderHook(() => useResetCategoryFilters());
    const { result: getter } = renderHook(() => useCategoryFilters());

    act(() => {
      setter.current({ page: 9 });
    });

    act(() => {
      resetter.current();
    });

    expect(getter.current).toEqual({ page: 1, limit: 10 });
  });

  // --- Selected Warehouse ---

  it("Given: default state When: useSelectedWarehouseId Then: should return null", () => {
    const { result } = renderHook(() => useSelectedWarehouseId());
    expect(result.current).toBeNull();
  });

  it("Given: setSelectedWarehouse called When: useSelectedWarehouseId Then: should return the warehouse id", () => {
    const { result: setter } = renderHook(() => useSetSelectedWarehouse());
    const { result: getter } = renderHook(() => useSelectedWarehouseId());

    act(() => {
      setter.current("wh-123");
    });

    expect(getter.current).toBe("wh-123");
  });

  it("Given: warehouse selected When: setSelectedWarehouse(null) Then: should clear selection", () => {
    const { result: setter } = renderHook(() => useSetSelectedWarehouse());
    const { result: getter } = renderHook(() => useSelectedWarehouseId());

    act(() => {
      setter.current("wh-123");
    });

    act(() => {
      setter.current(null);
    });

    expect(getter.current).toBeNull();
  });

  // --- Product Form State ---

  it("Given: default state When: useProductFormState Then: should return closed form", () => {
    const { result } = renderHook(() => useProductFormState());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.editingId).toBeNull();
  });

  it("Given: openProductForm called with id When: useProductFormState Then: should return open with editingId", () => {
    const { result } = renderHook(() => useProductFormState());

    act(() => {
      result.current.open("prod-456");
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.editingId).toBe("prod-456");
  });

  it("Given: openProductForm called without id When: useProductFormState Then: should return open with null editingId", () => {
    const { result } = renderHook(() => useProductFormState());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.editingId).toBeNull();
  });

  it("Given: form open When: closeProductForm Then: should close and clear editingId", () => {
    const { result } = renderHook(() => useProductFormState());

    act(() => {
      result.current.open("prod-456");
    });

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.editingId).toBeNull();
  });

  // --- Warehouse Form State ---

  it("Given: default state When: useWarehouseFormState Then: should return closed form", () => {
    const { result } = renderHook(() => useWarehouseFormState());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.editingId).toBeNull();
  });

  it("Given: openWarehouseForm called with id When: useWarehouseFormState Then: should return open with editingId", () => {
    const { result } = renderHook(() => useWarehouseFormState());

    act(() => {
      result.current.open("wh-789");
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.editingId).toBe("wh-789");
  });

  it("Given: openWarehouseForm called without id When: useWarehouseFormState Then: should return open with null editingId", () => {
    const { result } = renderHook(() => useWarehouseFormState());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.editingId).toBeNull();
  });

  it("Given: form open When: closeWarehouseForm Then: should close and clear editingId", () => {
    const { result } = renderHook(() => useWarehouseFormState());

    act(() => {
      result.current.open("wh-789");
    });

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.editingId).toBeNull();
  });

  // --- Category Form State ---

  it("Given: default state When: useCategoryFormState Then: should return closed form", () => {
    const { result } = renderHook(() => useCategoryFormState());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.editingId).toBeNull();
  });

  it("Given: openCategoryForm called with id When: useCategoryFormState Then: should return open with editingId", () => {
    const { result } = renderHook(() => useCategoryFormState());

    act(() => {
      result.current.open("cat-111");
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.editingId).toBe("cat-111");
  });

  it("Given: openCategoryForm called without id When: useCategoryFormState Then: should return open with null editingId", () => {
    const { result } = renderHook(() => useCategoryFormState());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.editingId).toBeNull();
  });

  it("Given: form open When: closeCategoryForm Then: should close and clear editingId", () => {
    const { result } = renderHook(() => useCategoryFormState());

    act(() => {
      result.current.open("cat-111");
    });

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.editingId).toBeNull();
  });

  // --- Store: resetAllFilters ---

  it("Given: multiple filters modified When: resetAllFilters Then: should reset all to defaults", () => {
    const store = useInventoryStore.getState();
    store.setProductFilters({ page: 5 });
    store.setWarehouseFilters({ page: 7 });
    store.setStockFilters({ page: 3 });
    store.setCategoryFilters({ page: 9 });

    store.resetAllFilters();

    const state = useInventoryStore.getState();
    expect(state.productFilters).toEqual({ page: 1, limit: 10 });
    expect(state.warehouseFilters).toEqual({ page: 1, limit: 10 });
    expect(state.stockFilters).toEqual({ page: 1, limit: 10 });
    expect(state.categoryFilters).toEqual({ page: 1, limit: 10 });
  });

  // --- Store: setSelectedProduct ---

  it("Given: default state When: setSelectedProduct Then: should update selectedProductId", () => {
    const store = useInventoryStore.getState();
    store.setSelectedProduct("prod-999");
    expect(useInventoryStore.getState().selectedProductId).toBe("prod-999");
  });

  it("Given: product selected When: setSelectedProduct(null) Then: should clear selection", () => {
    const store = useInventoryStore.getState();
    store.setSelectedProduct("prod-999");
    store.setSelectedProduct(null);
    expect(useInventoryStore.getState().selectedProductId).toBeNull();
  });

  // --- Filters merge behavior ---

  it("Given: existing filters When: setProductFilters with partial update Then: should merge", () => {
    const store = useInventoryStore.getState();
    store.setProductFilters({ page: 1, limit: 10 });
    store.setProductFilters({ page: 3 });

    expect(useInventoryStore.getState().productFilters).toEqual({
      page: 3,
      limit: 10,
    });
  });
});
