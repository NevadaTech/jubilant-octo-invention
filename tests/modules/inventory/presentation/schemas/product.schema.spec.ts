import { describe, it, expect } from 'vitest';
import {
  createProductSchema,
  toCreateProductDto,
  toUpdateProductDto,
  type CreateProductFormData,
  type UpdateProductFormData,
} from '@/modules/inventory/presentation/schemas/product.schema';

describe('Product Schema', () => {
  describe('createProductSchema', () => {
    it('Given: valid product data When: validating Then: should pass validation', () => {
      // Arrange
      const validData = {
        sku: 'PROD-001',
        name: 'Test Product',
        description: 'A test description',
        unitOfMeasure: 'unit',
        price: 19.99,
      };

      // Act
      const result = createProductSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    it('Given: empty SKU When: validating Then: should fail validation', () => {
      // Arrange
      const invalidData = {
        sku: '',
        name: 'Test Product',
        unitOfMeasure: 'unit',
        price: 20,
      };

      // Act
      const result = createProductSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it('Given: SKU with invalid characters When: validating Then: should fail validation', () => {
      // Arrange
      const invalidData = {
        sku: 'PROD 001!',
        name: 'Test Product',
        unitOfMeasure: 'unit',
        price: 20,
      };

      // Act
      const result = createProductSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it('Given: negative price When: validating Then: should fail validation', () => {
      // Arrange
      const invalidData = {
        sku: 'PROD-001',
        name: 'Test Product',
        unitOfMeasure: 'unit',
        price: -20,
      };

      // Act
      const result = createProductSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it('Given: valid categoryIds When: validating Then: should pass validation', () => {
      // Arrange
      const validData = {
        sku: 'PROD-001',
        name: 'Test Product',
        categoryIds: ['123e4567-e89b-12d3-a456-426614174000'],
        unitOfMeasure: 'unit',
        price: 20,
      };

      // Act
      const result = createProductSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    it('Given: no categoryIds When: validating Then: should pass validation (optional)', () => {
      // Arrange
      const validData = {
        sku: 'PROD-001',
        name: 'Test Product',
        unitOfMeasure: 'unit',
        price: 20,
      };

      // Act
      const result = createProductSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('toCreateProductDto', () => {
    it('Given: form data When: converting to DTO Then: should map all fields correctly', () => {
      // Arrange
      const formData: CreateProductFormData = {
        sku: 'PROD-001',
        name: 'Test Product',
        description: 'Description',
        categoryIds: ['123e4567-e89b-12d3-a456-426614174000'],
        unitOfMeasure: 'unit',
        price: 20,
      };

      // Act
      const dto = toCreateProductDto(formData);

      // Assert
      expect(dto.sku).toBe(formData.sku);
      expect(dto.name).toBe(formData.name);
      expect(dto.description).toBe(formData.description);
      expect(dto.categoryIds).toEqual(formData.categoryIds);
      expect(dto.unitOfMeasure).toBe(formData.unitOfMeasure);
      expect(dto.price).toBe(formData.price);
    });

    it('Given: form data with empty optional fields When: converting to DTO Then: should set them as undefined', () => {
      // Arrange
      const formData: CreateProductFormData = {
        sku: 'PROD-001',
        name: 'Test Product',
        description: '',
        unitOfMeasure: 'unit',
        price: 20,
      };

      // Act
      const dto = toCreateProductDto(formData);

      // Assert
      expect(dto.description).toBeUndefined();
    });
  });

  describe('toUpdateProductDto', () => {
    it('Given: partial form data When: converting to DTO Then: should only include defined fields', () => {
      // Arrange
      const formData: UpdateProductFormData = {
        name: 'Updated Name',
        price: 25,
        isActive: false,
      };

      // Act
      const dto = toUpdateProductDto(formData);

      // Assert
      expect(dto.name).toBe('Updated Name');
      expect(dto.price).toBe(25);
      expect(dto.isActive).toBe(false);
      expect(dto.sku).toBeUndefined();
    });
  });

});
