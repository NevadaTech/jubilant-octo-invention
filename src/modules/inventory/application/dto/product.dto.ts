/**
 * API Response DTOs for Products
 */

/** Unit object as returned/expected by the backend */
export interface ProductUnitDto {
  code: string;
  name: string;
  precision: number;
}

/** Forma real de la respuesta del backend */
export interface ProductApiRawDto {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  /** Objeto unidad (backend) */
  unit?: ProductUnitDto;
  unitOfMeasure?: string;
  barcode?: string;
  brand?: string;
  model?: string;
  status?: string;
  isActive?: boolean;
  costMethod?: string;
  price?: number;
  currency?: string;
  orgId?: string;
  // Computed fields from GetProductById (stock + reorder rules)
  averageCost?: number;
  totalStock?: number;
  margin?: number;
  profit?: number;
  minStock?: number;
  maxStock?: number;
  safetyStock?: number;
  // Legacy alias
  cost?: number;
  categoryId?: string | null;
  categoryName?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponseDto {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  categoryName: string | null;
  unitOfMeasure: string;
  cost: number;
  price: number;
  minStock: number;
  maxStock: number;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  // Computed fields
  averageCost: number;
  totalStock: number;
  margin: number;
  profit: number;
  safetyStock: number;
}

export interface ProductListResponseDto {
  data: ProductResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** What the backend actually accepts for CREATE */
export interface CreateProductApiDto {
  sku: string;
  name: string;
  unit: ProductUnitDto;
  description?: string;
  barcode?: string;
  brand?: string;
  model?: string;
  status?: string;
  costMethod?: string;
}

/** What the backend actually accepts for UPDATE */
export interface UpdateProductApiDto {
  name?: string;
  description?: string;
  unit?: ProductUnitDto;
  barcode?: string;
  brand?: string;
  model?: string;
  status?: string;
  costMethod?: string;
  price?: number;
  currency?: string;
}

/** Legacy DTOs kept for form compatibility */
export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  categoryId?: string;
  unitOfMeasure: string;
  cost: number;
  price: number;
  minStock: number;
  maxStock: number;
  imageUrl?: string;
}

export interface UpdateProductDto {
  sku?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  unitOfMeasure?: string;
  cost?: number;
  price?: number;
  minStock?: number;
  maxStock?: number;
  isActive?: boolean;
  imageUrl?: string;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
