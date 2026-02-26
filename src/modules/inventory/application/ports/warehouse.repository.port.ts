import type { PaginatedResult } from "@/shared/application/dto/pagination.dto";
import type { Warehouse } from "@/modules/inventory/domain/entities/warehouse.entity";
import type {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  WarehouseFilters,
} from "@/modules/inventory/application/dto/warehouse.dto";

export type { PaginatedResult };

export interface WarehouseRepositoryPort {
  findAll(filters?: WarehouseFilters): Promise<PaginatedResult<Warehouse>>;
  findById(id: string): Promise<Warehouse | null>;
  create(data: CreateWarehouseDto): Promise<Warehouse>;
  update(id: string, data: UpdateWarehouseDto): Promise<Warehouse>;
}
