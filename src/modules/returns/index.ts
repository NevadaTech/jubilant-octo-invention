// Domain
export { Return, ReturnLine } from "./domain/entities/return.entity";
export type {
  ReturnProps,
  ReturnLineProps,
  ReturnStatus,
  ReturnType,
} from "./domain/entities/return.entity";

// Application - DTOs
export type {
  ReturnResponseDto,
  ReturnApiRawDto,
  ReturnLineResponseDto,
  ReturnLineApiRawDto,
  ReturnListResponseDto,
  CreateReturnDto,
  CreateReturnLineDto,
  UpdateReturnDto,
  ReturnFilters,
} from "./application/dto/return.dto";

// Application - Ports
export type { ReturnRepositoryPort } from "./application/ports/return.repository.port";

// Presentation - Hooks
export {
  useReturns,
  useReturn,
  useCreateReturn,
  useUpdateReturn,
  useConfirmReturn,
  useCancelReturn,
  useAddReturnLine,
  useRemoveReturnLine,
} from "./presentation/hooks/use-returns";

// Presentation - Components
export {
  ReturnList,
  ReturnFormPage,
  ReturnDetail,
  ReturnStatusBadge,
  ReturnTypeBadge,
  ReturnFiltersComponent,
} from "./presentation/components";
