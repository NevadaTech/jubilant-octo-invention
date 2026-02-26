import type { PaginatedResult } from "@/shared/application/dto/pagination.dto";
import type {
  Transfer,
  TransferStatus,
} from "@/modules/inventory/domain/entities/transfer.entity";
import type {
  CreateTransferDto,
  ReceiveTransferDto,
  TransferFilters,
} from "@/modules/inventory/application/dto/transfer.dto";

export type { PaginatedResult };

export interface TransferRepositoryPort {
  findAll(filters?: TransferFilters): Promise<PaginatedResult<Transfer>>;
  findById(id: string): Promise<Transfer | null>;
  create(data: CreateTransferDto): Promise<Transfer>;
  updateStatus(id: string, status: TransferStatus): Promise<Transfer>;
  receive(id: string, data: ReceiveTransferDto): Promise<Transfer>;
}
