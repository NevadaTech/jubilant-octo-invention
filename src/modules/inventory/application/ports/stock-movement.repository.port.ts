import type { PaginatedResult } from "@/shared/application/dto/pagination.dto";
import type { StockMovement } from "@/modules/inventory/domain/entities/stock-movement.entity";
import type {
  CreateStockMovementDto,
  UpdateStockMovementDto,
  StockMovementFilters,
} from "@/modules/inventory/application/dto/stock-movement.dto";

export type { PaginatedResult };

export interface StockMovementRepositoryPort {
  findAll(
    filters?: StockMovementFilters,
  ): Promise<PaginatedResult<StockMovement>>;
  findById(id: string): Promise<StockMovement | null>;
  create(data: CreateStockMovementDto): Promise<StockMovement>;
  update(id: string, data: UpdateStockMovementDto): Promise<StockMovement>;
  delete(id: string): Promise<void>;
  post(id: string): Promise<void>;
  void(id: string): Promise<void>;
}
