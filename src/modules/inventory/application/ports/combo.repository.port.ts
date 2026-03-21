import type { PaginatedResult } from "@/shared/application/dto/pagination.dto";
import type { Combo } from "@/modules/inventory/domain/entities/combo.entity";
import type {
  CreateComboDto,
  UpdateComboDto,
  GetCombosQueryDto,
  GetComboAvailabilityQueryDto,
  ComboAvailabilityDto,
  GetComboSalesReportQueryDto,
  ComboSalesReportItemDto,
  GetComboStockImpactQueryDto,
  ComboStockImpactDto,
} from "@/modules/inventory/application/dto/combo.dto";

export type { PaginatedResult };

export interface ComboRepositoryPort {
  findAll(query?: GetCombosQueryDto): Promise<PaginatedResult<Combo>>;
  findById(id: string): Promise<Combo | null>;
  create(dto: CreateComboDto): Promise<Combo>;
  update(id: string, dto: UpdateComboDto): Promise<Combo>;
  deactivate(id: string): Promise<Combo>;
  getAvailability(
    query?: GetComboAvailabilityQueryDto,
  ): Promise<PaginatedResult<ComboAvailabilityDto>>;
  getSalesReport(
    query?: GetComboSalesReportQueryDto,
  ): Promise<ComboSalesReportItemDto[]>;
  getStockImpact(
    productId: string,
    query?: GetComboStockImpactQueryDto,
  ): Promise<ComboStockImpactDto>;
}
