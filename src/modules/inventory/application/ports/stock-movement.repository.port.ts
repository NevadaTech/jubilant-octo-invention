import type { StockMovement } from "../../domain/entities/stock-movement.entity";
import type {
  CreateStockMovementDto,
  UpdateStockMovementDto,
  StockMovementFilters,
} from "../dto/stock-movement.dto";

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StockMovementRepositoryPort {
  findAll(filters?: StockMovementFilters): Promise<PaginatedResult<StockMovement>>;
  findById(id: string): Promise<StockMovement | null>;
  create(data: CreateStockMovementDto): Promise<StockMovement>;
  update(id: string, data: UpdateStockMovementDto): Promise<StockMovement>;
  delete(id: string): Promise<void>;
  post(id: string): Promise<void>;
  void(id: string): Promise<void>;
}
