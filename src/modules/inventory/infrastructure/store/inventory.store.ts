import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ProductFilters,
  WarehouseFilters,
  StockFilters,
  CategoryFilters,
} from "@/modules/inventory/application/dto";

interface InventoryState {
  // Selected items
  selectedWarehouseId: string | null;
  selectedProductId: string | null;

  // Filters
  productFilters: ProductFilters;
  warehouseFilters: WarehouseFilters;
  stockFilters: StockFilters;
  categoryFilters: CategoryFilters;

  // UI state
  isProductFormOpen: boolean;
  isWarehouseFormOpen: boolean;
  isCategoryFormOpen: boolean;
  editingProductId: string | null;
  editingWarehouseId: string | null;
  editingCategoryId: string | null;
}

interface InventoryActions {
  // Selection actions
  setSelectedWarehouse: (id: string | null) => void;
  setSelectedProduct: (id: string | null) => void;

  // Filter actions
  setProductFilters: (filters: ProductFilters) => void;
  setWarehouseFilters: (filters: WarehouseFilters) => void;
  setStockFilters: (filters: StockFilters) => void;
  setCategoryFilters: (filters: CategoryFilters) => void;
  resetProductFilters: () => void;
  resetWarehouseFilters: () => void;
  resetStockFilters: () => void;
  resetCategoryFilters: () => void;
  resetAllFilters: () => void;

  // UI actions
  openProductForm: (productId?: string) => void;
  closeProductForm: () => void;
  openWarehouseForm: (warehouseId?: string) => void;
  closeWarehouseForm: () => void;
  openCategoryForm: (categoryId?: string) => void;
  closeCategoryForm: () => void;
}

type InventoryStore = InventoryState & InventoryActions;

const defaultProductFilters: ProductFilters = {
  page: 1,
  limit: 10,
};

const defaultWarehouseFilters: WarehouseFilters = {
  page: 1,
  limit: 10,
};

const defaultStockFilters: StockFilters = {
  page: 1,
  limit: 10,
};

const defaultCategoryFilters: CategoryFilters = {
  page: 1,
  limit: 10,
};

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set) => ({
      // Initial state
      selectedWarehouseId: null,
      selectedProductId: null,
      productFilters: defaultProductFilters,
      warehouseFilters: defaultWarehouseFilters,
      stockFilters: defaultStockFilters,
      categoryFilters: defaultCategoryFilters,
      isProductFormOpen: false,
      isWarehouseFormOpen: false,
      isCategoryFormOpen: false,
      editingProductId: null,
      editingWarehouseId: null,
      editingCategoryId: null,

      // Selection actions
      setSelectedWarehouse: (id) => set({ selectedWarehouseId: id }),
      setSelectedProduct: (id) => set({ selectedProductId: id }),

      // Filter actions
      setProductFilters: (filters) =>
        set((state) => ({
          productFilters: { ...state.productFilters, ...filters },
        })),
      setWarehouseFilters: (filters) =>
        set((state) => ({
          warehouseFilters: { ...state.warehouseFilters, ...filters },
        })),
      setStockFilters: (filters) =>
        set((state) => ({
          stockFilters: { ...state.stockFilters, ...filters },
        })),
      setCategoryFilters: (filters) =>
        set((state) => ({
          categoryFilters: { ...state.categoryFilters, ...filters },
        })),
      resetProductFilters: () => set({ productFilters: defaultProductFilters }),
      resetWarehouseFilters: () =>
        set({ warehouseFilters: defaultWarehouseFilters }),
      resetStockFilters: () => set({ stockFilters: defaultStockFilters }),
      resetCategoryFilters: () =>
        set({ categoryFilters: defaultCategoryFilters }),
      resetAllFilters: () =>
        set({
          productFilters: defaultProductFilters,
          warehouseFilters: defaultWarehouseFilters,
          stockFilters: defaultStockFilters,
          categoryFilters: defaultCategoryFilters,
        }),

      // UI actions
      openProductForm: (productId) =>
        set({
          isProductFormOpen: true,
          editingProductId: productId ?? null,
        }),
      closeProductForm: () =>
        set({
          isProductFormOpen: false,
          editingProductId: null,
        }),
      openWarehouseForm: (warehouseId) =>
        set({
          isWarehouseFormOpen: true,
          editingWarehouseId: warehouseId ?? null,
        }),
      closeWarehouseForm: () =>
        set({
          isWarehouseFormOpen: false,
          editingWarehouseId: null,
        }),
      openCategoryForm: (categoryId) =>
        set({
          isCategoryFormOpen: true,
          editingCategoryId: categoryId ?? null,
        }),
      closeCategoryForm: () =>
        set({
          isCategoryFormOpen: false,
          editingCategoryId: null,
        }),
    }),
    {
      name: "nevada-inventory-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist selected warehouse and filters
        selectedWarehouseId: state.selectedWarehouseId,
        productFilters: state.productFilters,
        warehouseFilters: state.warehouseFilters,
        stockFilters: state.stockFilters,
        categoryFilters: state.categoryFilters,
      }),
    },
  ),
);
