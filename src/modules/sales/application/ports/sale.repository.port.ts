import type { Sale } from "../../domain/entities/sale.entity";
import type {
  CreateSaleDto,
  CreateSaleLineDto,
  ShipSaleDto,
  UpdateSaleDto,
  SaleFilters,
} from "../dto/sale.dto";

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SaleRepositoryPort {
  findAll(filters?: SaleFilters): Promise<PaginatedResult<Sale>>;
  findById(id: string): Promise<Sale | null>;
  create(data: CreateSaleDto): Promise<Sale>;
  update(id: string, data: UpdateSaleDto): Promise<Sale>;
  confirm(id: string): Promise<Sale>;
  cancel(id: string): Promise<Sale>;
  startPicking(id: string): Promise<Sale>;
  ship(id: string, data: ShipSaleDto): Promise<Sale>;
  complete(id: string): Promise<Sale>;
  addLine(saleId: string, line: CreateSaleLineDto): Promise<Sale>;
  removeLine(saleId: string, lineId: string): Promise<Sale>;
}
