// Domain
export { Sale, SaleLine } from "./domain/entities/sale.entity";
export type {
  SaleProps,
  SaleLineProps,
  SaleStatus,
} from "./domain/entities/sale.entity";

// Application - DTOs
export type {
  SaleResponseDto,
  SaleApiRawDto,
  SaleLineResponseDto,
  SaleListResponseDto,
  CreateSaleDto,
  CreateSaleLineDto,
  UpdateSaleDto,
  ShipSaleDto,
  SaleFilters,
} from "./application/dto/sale.dto";

// Application - Ports
export type {
  SaleRepositoryPort,
  SaleReturnSummary,
} from "./application/ports/sale.repository.port";

// Presentation - Hooks
export {
  useSales,
  useSale,
  useSaleReturns,
  useCreateSale,
  useUpdateSale,
  useConfirmSale,
  useCancelSale,
  useStartPicking,
  useShipSale,
  useCompleteSale,
  useAddSaleLine,
  useRemoveSaleLine,
} from "./presentation/hooks/use-sales";

// Presentation - Components
export {
  SaleList,
  SaleFormPage,
  SaleDetail,
  SaleStatusBadge,
  SaleFiltersComponent,
  SaleTimeline,
} from "./presentation/components";
