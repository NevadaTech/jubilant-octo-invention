/**
 * API Response DTOs for Categories
 */

export interface CategoryResponseDto {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  parentName: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryListResponseDto {
  data: CategoryResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  parentId?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}

export interface CategoryFilters {
  search?: string;
  parentId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "name" | "isActive" | "productCount" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}
