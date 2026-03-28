import type { PaginatedResult } from "@/shared/application/dto/pagination.dto";
import type { Brand } from "@/modules/brands/domain/entities/brand.entity";
import type {
  CreateBrandDto,
  UpdateBrandDto,
  BrandFilters,
} from "@/modules/brands/application/dto/brand.dto";

export type { PaginatedResult };

export interface BrandRepositoryPort {
  findAll(filters?: BrandFilters): Promise<PaginatedResult<Brand>>;
  findById(id: string): Promise<Brand | null>;
  create(data: CreateBrandDto): Promise<Brand>;
  update(id: string, data: UpdateBrandDto): Promise<Brand>;
  delete(id: string): Promise<void>;
}
