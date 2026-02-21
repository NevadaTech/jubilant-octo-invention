import type { Stock } from "../../domain/entities/stock.entity";
import type { StockFilters } from "../dto/stock.dto";

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StockRepositoryPort {
  findAll(filters?: StockFilters): Promise<PaginatedResult<Stock>>;
  findByProductAndWarehouse(
    productId: string,
    warehouseId: string,
  ): Promise<Stock | null>;
}
