import { apiClient } from "@/shared/infrastructure/http";
import type { Product } from "../../domain/entities/product.entity";
import type {
  ProductRepositoryPort,
  PaginatedResult,
} from "../../application/ports/product.repository.port";
import type {
  ProductListResponseDto,
  ProductResponseDto,
  ProductApiRawDto,
  CreateProductDto,
  UpdateProductDto,
  CreateProductApiDto,
  UpdateProductApiDto,
  ProductFilters,
} from "../../application/dto/product.dto";
import { ProductMapper } from "../../application/mappers/product.mapper";

interface ApiResponse<T> {
  data: T;
}

/** Convierte la respuesta real del API al DTO que espera el dominio */
function mapApiProductToDto(raw: ProductApiRawDto): ProductResponseDto {
  const unit = raw.unit;
  const unitOfMeasure =
    raw.unitOfMeasure ??
    (typeof unit === "object" && unit !== null
      ? (unit.name ?? unit.code ?? "UNIT")
      : "UNIT");

  return {
    id: raw.id,
    sku: raw.sku,
    name: raw.name,
    description: raw.description ?? null,
    categories: raw.categories ?? [],
    unitOfMeasure,
    cost: raw.averageCost ?? raw.cost ?? 0,
    price: raw.price ?? 0,
    minStock: raw.minStock ?? 0,
    maxStock: raw.maxStock ?? 0,
    isActive: raw.isActive ?? raw.status === "ACTIVE",
    imageUrl: raw.imageUrl ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    // Computed fields from backend
    averageCost: raw.averageCost ?? 0,
    totalStock: raw.totalStock ?? 0,
    margin: raw.margin ?? 0,
    profit: raw.profit ?? 0,
    safetyStock: raw.safetyStock ?? 0,
    // Rotation metrics
    totalIn30d: raw.totalIn30d ?? 0,
    totalOut30d: raw.totalOut30d ?? 0,
    avgDailyConsumption: raw.avgDailyConsumption ?? 0,
    daysOfStock: raw.daysOfStock ?? null,
    turnoverRate: raw.turnoverRate ?? 0,
    lastMovementDate: raw.lastMovementDate ?? null,
    statusChangedBy: raw.statusChangedBy ?? null,
    statusChangedAt: raw.statusChangedAt ?? null,
  };
}

/** Transforma form data al formato que el backend espera para CREATE */
function toCreateApiDto(data: CreateProductDto): CreateProductApiDto {
  return {
    sku: data.sku,
    name: data.name,
    unit: {
      code: data.unitOfMeasure.toUpperCase().replace(/\s+/g, "_"),
      name: data.unitOfMeasure,
      precision: 0,
    },
    description: data.description || undefined,
    categoryIds: data.categoryIds,
    price: data.price || undefined,
  };
}

/** Transforma form data al formato que el backend espera para UPDATE */
function toUpdateApiDto(data: UpdateProductDto): UpdateProductApiDto {
  const dto: UpdateProductApiDto = {};

  if (data.name !== undefined) dto.name = data.name;
  if (data.description !== undefined)
    dto.description = data.description || undefined;
  if (data.categoryIds !== undefined) dto.categoryIds = data.categoryIds;
  if (data.unitOfMeasure !== undefined) {
    dto.unit = {
      code: data.unitOfMeasure.toUpperCase().replace(/\s+/g, "_"),
      name: data.unitOfMeasure,
      precision: 0,
    };
  }
  if (data.price !== undefined) dto.price = data.price;
  if (data.isActive !== undefined) {
    dto.status = data.isActive ? "ACTIVE" : "INACTIVE";
  }

  return dto;
}

export class ProductApiAdapter implements ProductRepositoryPort {
  private readonly basePath = "/inventory/products";

  async findAll(filters?: ProductFilters): Promise<PaginatedResult<Product>> {
    const response = await apiClient.get<{
      data: ProductApiRawDto[];
      pagination: ProductListResponseDto["pagination"];
    }>(this.basePath, {
      params: this.buildQueryParams(filters),
    });

    return {
      data: response.data.data.map((raw) =>
        ProductMapper.toDomain(mapApiProductToDto(raw)),
      ),
      pagination: response.data.pagination,
    };
  }

  async findById(id: string): Promise<Product | null> {
    try {
      const response = await apiClient.get<ApiResponse<ProductApiRawDto>>(
        `${this.basePath}/${id}`,
      );
      const dto = mapApiProductToDto(response.data.data);
      return ProductMapper.toDomain(dto);
    } catch (error) {
      // Return null if product not found (404)
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async create(data: CreateProductDto): Promise<Product> {
    const apiDto = toCreateApiDto(data);
    const response = await apiClient.post<ApiResponse<ProductApiRawDto>>(
      this.basePath,
      apiDto,
    );
    const dto = mapApiProductToDto(response.data.data);
    return ProductMapper.toDomain(dto);
  }

  async update(id: string, data: UpdateProductDto): Promise<Product> {
    const apiDto = toUpdateApiDto(data);
    const response = await apiClient.put<ApiResponse<ProductApiRawDto>>(
      `${this.basePath}/${id}`,
      apiDto,
    );
    const dto = mapApiProductToDto(response.data.data);
    return ProductMapper.toDomain(dto);
  }

  private buildQueryParams(filters?: ProductFilters): Record<string, unknown> {
    if (!filters) return {};

    const params: Record<string, unknown> = {};

    if (filters.search) {
      params.search = filters.search;
    }
    if (filters.categoryId) {
      params.categoryId = filters.categoryId;
    }
    if (filters.isActive !== undefined) {
      params.status = filters.isActive ? "ACTIVE" : "INACTIVE";
    }
    if (filters.page) {
      params.page = filters.page;
    }
    if (filters.limit) {
      params.limit = filters.limit;
    }

    return params;
  }

  private isNotFoundError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: { status?: number } }).response ===
        "object" &&
      (error as { response: { status?: number } }).response?.status === 404
    );
  }
}

export const productApiAdapter = new ProductApiAdapter();
