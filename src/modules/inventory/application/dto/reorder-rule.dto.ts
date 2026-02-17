export interface ReorderRuleApiDto {
  id: string;
  productId: string;
  warehouseId: string;
  minQty: number;
  maxQty: number;
  safetyQty: number;
}

export interface ReorderRuleListResponseDto {
  success: boolean;
  message: string;
  data: ReorderRuleApiDto[];
  timestamp: string;
}

export interface ReorderRuleSingleResponseDto {
  success: boolean;
  message: string;
  data: ReorderRuleApiDto;
  timestamp: string;
}

export interface CreateReorderRuleDto {
  productId: string;
  warehouseId: string;
  minQty: number;
  maxQty: number;
  safetyQty: number;
}

export interface UpdateReorderRuleDto {
  minQty?: number;
  maxQty?: number;
  safetyQty?: number;
}
