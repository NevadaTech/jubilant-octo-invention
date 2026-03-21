export interface IntegrationSkuMappingResponseDto {
  id: string;
  connectionId: string;
  externalSku: string;
  productId: string;
  productName?: string;
  productSku?: string;
  comboId?: string;
  comboName?: string;
  comboSku?: string;
  createdAt: string;
}

export interface IntegrationSkuMappingListResponseDto {
  success: boolean;
  message: string;
  data: IntegrationSkuMappingResponseDto[];
  timestamp: string;
}

export interface CreateSkuMappingDto {
  externalSku: string;
  productId: string;
}

export interface UnmatchedSkuRawDto {
  id: string;
  externalOrderId: string;
  errorMessage?: string;
  processedAt: string;
}

export interface UnmatchedSkuDto {
  id: string;
  externalSku: string;
  externalOrderId: string;
  errorMessage?: string;
  processedAt: string;
}

export interface UnmatchedSkusResponseDto {
  success: boolean;
  message: string;
  data: UnmatchedSkuRawDto[];
  timestamp: string;
}
