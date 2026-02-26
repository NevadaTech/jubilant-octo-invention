import type { PaginatedResult } from "@/shared/application/dto/pagination.dto";
import type { Category } from "@/modules/inventory/domain/entities/category.entity";
import type {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryFilters,
} from "@/modules/inventory/application/dto/category.dto";

export type { PaginatedResult };

export interface CategoryRepositoryPort {
  findAll(filters?: CategoryFilters): Promise<PaginatedResult<Category>>;
  findById(id: string): Promise<Category | null>;
  create(data: CreateCategoryDto): Promise<Category>;
  update(id: string, data: UpdateCategoryDto): Promise<Category>;
  delete(id: string): Promise<void>;
}
