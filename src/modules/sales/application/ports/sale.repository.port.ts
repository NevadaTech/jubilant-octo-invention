import type { PaginatedResult } from "@/shared/application/dto/pagination.dto";
import type { Sale } from "@/modules/sales/domain/entities/sale.entity";
import type {
  CreateSaleDto,
  CreateSaleLineDto,
  ShipSaleDto,
  SwapSaleLineDto,
  SwapSaleLineResponseData,
  SwapHistoryItem,
  UpdateSaleDto,
  SaleFilters,
} from "@/modules/sales/application/dto/sale.dto";

export type { PaginatedResult };

export interface SaleReturnSummary {
  id: string;
  returnNumber: string;
  status: string;
  type: string;
  totalAmount: number;
  currency: string;
  createdAt: Date;
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
  getReturns(saleId: string): Promise<SaleReturnSummary[]>;
  swapLine(
    saleId: string,
    data: SwapSaleLineDto,
  ): Promise<SwapSaleLineResponseData>;
  getSwapHistory(saleId: string): Promise<SwapHistoryItem[]>;
}
