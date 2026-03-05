import type { PaginatedResult } from "@/shared/application/dto/pagination.dto";
import type { Company } from "@/modules/companies/domain/entities/company.entity";
import type {
  CreateCompanyDto,
  UpdateCompanyDto,
  CompanyFilters,
} from "@/modules/companies/application/dto/company.dto";

export type { PaginatedResult };

export interface CompanyRepositoryPort {
  findAll(filters?: CompanyFilters): Promise<PaginatedResult<Company>>;
  findById(id: string): Promise<Company | null>;
  create(data: CreateCompanyDto): Promise<Company>;
  update(id: string, data: UpdateCompanyDto): Promise<Company>;
  delete(id: string): Promise<void>;
}
