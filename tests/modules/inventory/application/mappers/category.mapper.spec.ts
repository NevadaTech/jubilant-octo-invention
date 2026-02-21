import { describe, it, expect } from "vitest";
import { CategoryMapper } from "@/modules/inventory/application/mappers/category.mapper";
import type { CategoryResponseDto } from "@/modules/inventory/application/dto/category.dto";

describe("CategoryMapper", () => {
  const mockCategoryDto: CategoryResponseDto = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Electronics",
    description: "Electronic devices and components",
    parentId: "456e7890-e89b-12d3-a456-426614174000",
    parentName: "Products",
    isActive: true,
    productCount: 42,
    createdAt: "2025-01-15T10:30:00.000Z",
    updatedAt: "2025-01-16T14:20:00.000Z",
  };

  describe("toDomain", () => {
    it("Given: a valid CategoryResponseDto When: mapping to domain Then: should return a Category entity", () => {
      // Act
      const category = CategoryMapper.toDomain(mockCategoryDto);

      // Assert
      expect(category.id).toBe(mockCategoryDto.id);
      expect(category.name).toBe(mockCategoryDto.name);
      expect(category.description).toBe(mockCategoryDto.description);
      expect(category.parentId).toBe(mockCategoryDto.parentId);
      expect(category.parentName).toBe(mockCategoryDto.parentName);
      expect(category.isActive).toBe(mockCategoryDto.isActive);
      expect(category.productCount).toBe(mockCategoryDto.productCount);
    });

    it("Given: a CategoryResponseDto with date strings When: mapping to domain Then: should convert dates correctly", () => {
      // Act
      const category = CategoryMapper.toDomain(mockCategoryDto);

      // Assert
      expect(category.createdAt).toBeInstanceOf(Date);
      expect(category.updatedAt).toBeInstanceOf(Date);
      expect(category.createdAt.toISOString()).toBe(mockCategoryDto.createdAt);
      expect(category.updatedAt.toISOString()).toBe(mockCategoryDto.updatedAt);
    });

    it("Given: a root category (no parent) When: mapping to domain Then: should have null parent values", () => {
      // Arrange
      const rootCategoryDto: CategoryResponseDto = {
        ...mockCategoryDto,
        parentId: null,
        parentName: null,
      };

      // Act
      const category = CategoryMapper.toDomain(rootCategoryDto);

      // Assert
      expect(category.parentId).toBeNull();
      expect(category.parentName).toBeNull();
      expect(category.hasParent).toBe(false);
    });

    it("Given: a category with parent When: mapping to domain Then: hasParent should be true", () => {
      // Act
      const category = CategoryMapper.toDomain(mockCategoryDto);

      // Assert
      expect(category.hasParent).toBe(true);
    });

    it("Given: a category with products When: mapping to domain Then: hasProducts should be true", () => {
      // Act
      const category = CategoryMapper.toDomain(mockCategoryDto);

      // Assert
      expect(category.productCount).toBe(42);
      expect(category.hasProducts).toBe(true);
    });

    it("Given: a category without products When: mapping to domain Then: hasProducts should be false", () => {
      // Arrange
      const emptyCategoryDto: CategoryResponseDto = {
        ...mockCategoryDto,
        productCount: 0,
      };

      // Act
      const category = CategoryMapper.toDomain(emptyCategoryDto);

      // Assert
      expect(category.productCount).toBe(0);
      expect(category.hasProducts).toBe(false);
    });
  });

  describe("toDto", () => {
    it("Given: a Category entity When: mapping to DTO Then: should return a CategoryResponseDto", () => {
      // Arrange
      const category = CategoryMapper.toDomain(mockCategoryDto);

      // Act
      const dto = CategoryMapper.toDto(category);

      // Assert
      expect(dto.id).toBe(category.id);
      expect(dto.name).toBe(category.name);
      expect(dto.description).toBe(category.description);
      expect(dto.parentId).toBe(category.parentId);
      expect(dto.parentName).toBe(category.parentName);
      expect(dto.isActive).toBe(category.isActive);
      expect(dto.productCount).toBe(category.productCount);
    });

    it("Given: a Category entity with Date values When: mapping to DTO Then: should convert dates to ISO strings", () => {
      // Arrange
      const category = CategoryMapper.toDomain(mockCategoryDto);

      // Act
      const dto = CategoryMapper.toDto(category);

      // Assert
      expect(typeof dto.createdAt).toBe("string");
      expect(typeof dto.updatedAt).toBe("string");
    });
  });

  describe("round-trip", () => {
    it("Given: a CategoryResponseDto When: mapping to domain and back to DTO Then: should be equivalent", () => {
      // Act
      const category = CategoryMapper.toDomain(mockCategoryDto);
      const resultDto = CategoryMapper.toDto(category);

      // Assert
      expect(resultDto).toEqual(mockCategoryDto);
    });
  });
});
