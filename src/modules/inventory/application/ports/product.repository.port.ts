import type { PaginatedResult } from "@/shared/application/dto/pagination.dto";
import type { Product } from "@/modules/inventory/domain/entities/product.entity";
import type {
  CreateProductDto,
  UpdateProductDto,
  ProductFilters,
} from "@/modules/inventory/application/dto/product.dto";

export type { PaginatedResult };

export interface ProductRepositoryPort {
  findAll(filters?: ProductFilters): Promise<PaginatedResult<Product>>;
  findById(id: string): Promise<Product | null>;
  create(data: CreateProductDto): Promise<Product>;
  update(id: string, data: UpdateProductDto): Promise<Product>;
}
