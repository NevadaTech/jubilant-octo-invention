export {
  useProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useToggleProductStatus,
  productKeys,
} from "./use-products";

export {
  useWarehouses,
  useWarehouse,
  useCreateWarehouse,
  useUpdateWarehouse,
  useToggleWarehouseStatus,
  warehouseKeys,
} from "./use-warehouses";

export { useStock, useStockByLocation, stockKeys } from "./use-stock";

export {
  useCategories,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  categoryKeys,
} from "./use-categories";

export {
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
} from "./use-inventory-store";
