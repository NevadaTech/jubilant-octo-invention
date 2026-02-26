export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: Pagination;
}
