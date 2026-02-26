import type { PaginatedResult } from "@/shared/application/dto/pagination.dto";
import type { Return } from "@/modules/returns/domain/entities/return.entity";
import type {
  CreateReturnDto,
  CreateReturnLineDto,
  UpdateReturnDto,
  ReturnFilters,
} from "@/modules/returns/application/dto/return.dto";

export type { PaginatedResult };

export interface ReturnRepositoryPort {
  findAll(filters?: ReturnFilters): Promise<PaginatedResult<Return>>;
  findById(id: string): Promise<Return | null>;
  create(data: CreateReturnDto): Promise<Return>;
  update(id: string, data: UpdateReturnDto): Promise<Return>;
  confirm(id: string): Promise<Return>;
  cancel(id: string): Promise<Return>;
  addLine(returnId: string, line: CreateReturnLineDto): Promise<Return>;
  removeLine(returnId: string, lineId: string): Promise<Return>;
}
