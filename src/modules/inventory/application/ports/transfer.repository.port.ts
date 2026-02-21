import type {
  Transfer,
  TransferStatus,
} from "../../domain/entities/transfer.entity";
import type {
  CreateTransferDto,
  ReceiveTransferDto,
  TransferFilters,
} from "../dto/transfer.dto";

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TransferRepositoryPort {
  findAll(filters?: TransferFilters): Promise<PaginatedResult<Transfer>>;
  findById(id: string): Promise<Transfer | null>;
  create(data: CreateTransferDto): Promise<Transfer>;
  updateStatus(id: string, status: TransferStatus): Promise<Transfer>;
  receive(id: string, data: ReceiveTransferDto): Promise<Transfer>;
}
