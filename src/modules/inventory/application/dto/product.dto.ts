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
  // Rotation metrics
  totalIn30d?: number;
  totalOut30d?: number;
  avgDailyConsumption?: number;
  daysOfStock?: number | null;
  turnoverRate?: number;
  lastMovementDate?: string | null;
  // Legacy alias
  cost?: number;
  categories?: { id: string; name: string }[];
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  statusChangedBy?: string | null;
  statusChangedAt?: string | null;
  companyId?: string | null;
  companyName?: string | null;
}

export interface ProductResponseDto {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categories: { id: string; name: string }[];
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
  // Rotation metrics
  totalIn30d: number;
  totalOut30d: number;
  avgDailyConsumption: number;
  daysOfStock: number | null;
  turnoverRate: number;
  lastMovementDate: string | null;
  statusChangedBy?: string | null;
  statusChangedAt?: string | null;
  companyId?: string | null;
  companyName?: string | null;
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
  categoryIds?: string[];
  barcode?: string;
  brand?: string;
  model?: string;
  price?: number;
  currency?: string;
  status?: string;
  costMethod?: string;
  companyId?: string;
}

/** What the backend actually accepts for UPDATE */
export interface UpdateProductApiDto {
  name?: string;
  description?: string;
  categoryIds?: string[];
  unit?: ProductUnitDto;
  barcode?: string;
  brand?: string;
  model?: string;
  status?: string;
  costMethod?: string;
  price?: number;
  currency?: string;
  companyId?: string;
}

/** Legacy DTOs kept for form compatibility */
export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  categoryIds?: string[];
  unitOfMeasure: string;
  cost: number;
  price: number;
  minStock: number;
  maxStock: number;
  imageUrl?: string;
  companyId?: string;
}

export interface UpdateProductDto {
  sku?: string;
  name?: string;
  description?: string;
  categoryIds?: string[];
  unitOfMeasure?: string;
  cost?: number;
  price?: number;
  minStock?: number;
  maxStock?: number;
  isActive?: boolean;
  imageUrl?: string;
  companyId?: string;
}

export interface ProductFilters {
  search?: string;
  categoryIds?: string[];
  companyId?: string;
  statuses?: string[];
  sortBy?: "name" | "sku" | "price" | "status" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
