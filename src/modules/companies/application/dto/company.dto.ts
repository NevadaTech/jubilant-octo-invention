export interface CompanyResponseDto {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyListResponseDto {
  data: CompanyResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateCompanyDto {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateCompanyDto {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface CompanyFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?:
    | "name"
    | "code"
    | "isActive"
    | "productCount"
    | "createdAt"
    | "updatedAt";
  sortOrder?: "asc" | "desc";
}
