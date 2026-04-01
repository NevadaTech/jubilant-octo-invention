import { describe, it, expect } from "vitest";
import { ProductMapper } from "@/modules/inventory/application/mappers/product.mapper";
import type { ProductResponseDto } from "@/modules/inventory/application/dto/product.dto";

describe("ProductMapper", () => {
  const mockProductDto: ProductResponseDto = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    sku: "PROD-001",
    name: "Test Product",
    description: "A test product description",
    categories: [
      { id: "456e7890-e89b-12d3-a456-426614174000", name: "Test Category" },
    ],
    unitOfMeasure: "unit",
    cost: 10.5,
    price: 19.99,
    minStock: 5,
    maxStock: 100,
    isActive: true,
    imageUrl: "https://example.com/image.jpg",
    createdAt: "2025-01-15T10:30:00.000Z",
    updatedAt: "2025-01-16T14:20:00.000Z",
    averageCost: 10.5,
    totalStock: 50,
    margin: 47.5,
    profit: 9.49,
    safetyStock: 10,
    totalIn30d: 100,
    totalOut30d: 50,
    avgDailyConsumption: 1.67,
    daysOfStock: 30,
    turnoverRate: 1.0,
    lastMovementDate: null,
    statusChangedBy: null,
    statusChangedAt: null,
    barcode: "BAR-123",
    companyId: null,
    companyName: null,
    brandId: null,
    brandName: null,
  };

  describe("toDomain", () => {
    it("Given: a valid ProductResponseDto When: mapping to domain Then: should return a Product entity", () => {
      // Act
      const product = ProductMapper.toDomain(mockProductDto);

      // Assert
      expect(product.id).toBe(mockProductDto.id);
      expect(product.sku).toBe(mockProductDto.sku);
      expect(product.name).toBe(mockProductDto.name);
      expect(product.description).toBe(mockProductDto.description);
      expect(product.categories).toEqual(mockProductDto.categories);
      expect(product.unitOfMeasure).toBe(mockProductDto.unitOfMeasure);
      expect(product.cost).toBe(mockProductDto.cost);
      expect(product.price).toBe(mockProductDto.price);
      expect(product.minStock).toBe(mockProductDto.minStock);
      expect(product.maxStock).toBe(mockProductDto.maxStock);
      expect(product.isActive).toBe(mockProductDto.isActive);
      expect(product.imageUrl).toBe(mockProductDto.imageUrl);
    });

    it("Given: a ProductResponseDto with date strings When: mapping to domain Then: should convert dates correctly", () => {
      // Act
      const product = ProductMapper.toDomain(mockProductDto);

      // Assert
      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeInstanceOf(Date);
      expect(product.createdAt.toISOString()).toBe(mockProductDto.createdAt);
      expect(product.updatedAt.toISOString()).toBe(mockProductDto.updatedAt);
    });

    it("Given: a ProductResponseDto with null values When: mapping to domain Then: should preserve nulls", () => {
      // Arrange
      const dtoWithNulls: ProductResponseDto = {
        ...mockProductDto,
        description: null,
        categories: [],
        imageUrl: null,
      };

      // Act
      const product = ProductMapper.toDomain(dtoWithNulls);

      // Assert
      expect(product.description).toBeNull();
      expect(product.categories).toEqual([]);
      expect(product.imageUrl).toBeNull();
    });
  });

  describe("toDto", () => {
    it("Given: a Product entity When: mapping to DTO Then: should return a ProductResponseDto", () => {
      // Arrange
      const product = ProductMapper.toDomain(mockProductDto);

      // Act
      const dto = ProductMapper.toDto(product);

      // Assert
      expect(dto.id).toBe(product.id);
      expect(dto.sku).toBe(product.sku);
      expect(dto.name).toBe(product.name);
      expect(dto.description).toBe(product.description);
      expect(dto.categories).toEqual(product.categories);
      expect(dto.unitOfMeasure).toBe(product.unitOfMeasure);
      expect(dto.cost).toBe(product.cost);
      expect(dto.price).toBe(product.price);
      expect(dto.minStock).toBe(product.minStock);
      expect(dto.maxStock).toBe(product.maxStock);
      expect(dto.isActive).toBe(product.isActive);
      expect(dto.imageUrl).toBe(product.imageUrl);
    });

    it("Given: a Product entity with Date values When: mapping to DTO Then: should convert dates to ISO strings", () => {
      // Arrange
      const product = ProductMapper.toDomain(mockProductDto);

      // Act
      const dto = ProductMapper.toDto(product);

      // Assert
      expect(typeof dto.createdAt).toBe("string");
      expect(typeof dto.updatedAt).toBe("string");
      expect(dto.createdAt).toBe(mockProductDto.createdAt);
      expect(dto.updatedAt).toBe(mockProductDto.updatedAt);
    });
  });

  describe("round-trip", () => {
    it("Given: a ProductResponseDto When: mapping to domain and back to DTO Then: should be equivalent", () => {
      // Act
      const product = ProductMapper.toDomain(mockProductDto);
      const resultDto = ProductMapper.toDto(product);

      // Assert
      expect(resultDto).toEqual(mockProductDto);
    });
  });
});
