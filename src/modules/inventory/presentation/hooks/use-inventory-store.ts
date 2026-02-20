"use client";

import { useShallow } from "zustand/react/shallow";
import { useInventoryStore } from "../../infrastructure/store/inventory.store";

// Product filters selectors
export function useProductFilters() {
  return useInventoryStore((state) => state.productFilters);
}

export function useSetProductFilters() {
  return useInventoryStore((state) => state.setProductFilters);
}

export function useResetProductFilters() {
  return useInventoryStore((state) => state.resetProductFilters);
}

// Warehouse filters selectors
export function useWarehouseFilters() {
  return useInventoryStore((state) => state.warehouseFilters);
}

export function useSetWarehouseFilters() {
  return useInventoryStore((state) => state.setWarehouseFilters);
}

export function useResetWarehouseFilters() {
  return useInventoryStore((state) => state.resetWarehouseFilters);
}

// Stock filters selectors
export function useStockFilters() {
  return useInventoryStore((state) => state.stockFilters);
}

export function useSetStockFilters() {
  return useInventoryStore((state) => state.setStockFilters);
}

export function useResetStockFilters() {
  return useInventoryStore((state) => state.resetStockFilters);
}

// Selected warehouse
export function useSelectedWarehouseId() {
  return useInventoryStore((state) => state.selectedWarehouseId);
}

export function useSetSelectedWarehouse() {
  return useInventoryStore((state) => state.setSelectedWarehouse);
}

// Product form state
export function useProductFormState() {
  return useInventoryStore(useShallow((state) => ({
    isOpen: state.isProductFormOpen,
    editingId: state.editingProductId,
    open: state.openProductForm,
    close: state.closeProductForm,
  })));
}

// Warehouse form state
export function useWarehouseFormState() {
  return useInventoryStore(useShallow((state) => ({
    isOpen: state.isWarehouseFormOpen,
    editingId: state.editingWarehouseId,
    open: state.openWarehouseForm,
    close: state.closeWarehouseForm,
  })));
}

// Category filters selectors
export function useCategoryFilters() {
  return useInventoryStore((state) => state.categoryFilters);
}

export function useSetCategoryFilters() {
  return useInventoryStore((state) => state.setCategoryFilters);
}

export function useResetCategoryFilters() {
  return useInventoryStore((state) => state.resetCategoryFilters);
}

// Category form state
export function useCategoryFormState() {
  return useInventoryStore(useShallow((state) => ({
    isOpen: state.isCategoryFormOpen,
    editingId: state.editingCategoryId,
    open: state.openCategoryForm,
    close: state.closeCategoryForm,
  })));
}
