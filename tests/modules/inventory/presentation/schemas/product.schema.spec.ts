import { describe, it, expect } from "vitest";
import {
  createProductSchema,
  toCreateProductDto,
  toUpdateProductDto,
  type CreateProductFormData,
  type UpdateProductFormData,
} from "@/modules/inventory/presentation/schemas/product.schema";

describe("Product Schema", () => {
  describe("createProductSchema", () => {
    it("Given: valid product data When: validating Then: should pass validation", () => {
      // Arrange
      const validData = {
        sku: "PROD-001",
        name: "Test Product",
        description: "A test description",
        unitOfMeasure: "unit",
        price: 19.99,
      };

      // Act
      const result = createProductSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: empty SKU When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = {
        sku: "",
        name: "Test Product",
        unitOfMeasure: "unit",
        price: 20,
      };

      // Act
      const result = createProductSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: SKU with invalid characters When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = {
        sku: "PROD 001!",
        name: "Test Product",
        unitOfMeasure: "unit",
        price: 20,
      };

      // Act
      const result = createProductSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: negative price When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = {
        sku: "PROD-001",
        name: "Test Product",
        unitOfMeasure: "unit",
        price: -20,
      };

      // Act
      const result = createProductSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: valid categoryIds When: validating Then: should pass validation", () => {
      // Arrange
      const validData = {
        sku: "PROD-001",
        name: "Test Product",
        categoryIds: ["123e4567-e89b-12d3-a456-426614174000"],
        unitOfMeasure: "unit",
        price: 20,
      };

      // Act
      const result = createProductSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: no categoryIds When: validating Then: should pass validation (optional)", () => {
      // Arrange
      const validData = {
        sku: "PROD-001",
        name: "Test Product",
        unitOfMeasure: "unit",
        price: 20,
      };

      // Act
      const result = createProductSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("toCreateProductDto", () => {
    it("Given: form data When: converting to DTO Then: should map all fields correctly", () => {
      // Arrange
      const formData: CreateProductFormData = {
        sku: "PROD-001",
        name: "Test Product",
        description: "Description",
        categoryIds: ["123e4567-e89b-12d3-a456-426614174000"],
        unitOfMeasure: "unit",
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

    it("Given: form data with empty optional fields When: converting to DTO Then: should set them as undefined", () => {
      // Arrange
      const formData: CreateProductFormData = {
        sku: "PROD-001",
        name: "Test Product",
        description: "",
        unitOfMeasure: "unit",
        price: 20,
      };

      // Act
      const dto = toCreateProductDto(formData);

      // Assert
      expect(dto.description).toBeUndefined();
    });
  });

  describe("toUpdateProductDto", () => {
    it("Given: partial form data When: converting to DTO Then: should only include defined fields", () => {
      // Arrange
      const formData: UpdateProductFormData = {
        name: "Updated Name",
        price: 25,
        isActive: false,
      };

      // Act
      const dto = toUpdateProductDto(formData);

      // Assert
      expect(dto.name).toBe("Updated Name");
      expect(dto.price).toBe(25);
      expect(dto.isActive).toBe(false);
      expect(dto.sku).toBeUndefined();
    });

    it("Given: empty description When: converting to DTO Then: should set description to undefined", () => {
      const formData: UpdateProductFormData = {
        description: "",
      };

      const dto = toUpdateProductDto(formData);

      expect(dto.description).toBeUndefined();
    });

    it("Given: non-empty description When: converting to DTO Then: should include description", () => {
      const formData: UpdateProductFormData = {
        description: "A description",
      };

      const dto = toUpdateProductDto(formData);

      expect(dto.description).toBe("A description");
    });

    it("Given: categoryIds defined When: converting to DTO Then: should include categoryIds", () => {
      const formData: UpdateProductFormData = {
        categoryIds: ["cat-1", "cat-2"],
      };

      const dto = toUpdateProductDto(formData);

      expect(dto.categoryIds).toEqual(["cat-1", "cat-2"]);
    });

    it("Given: unitOfMeasure defined When: converting to DTO Then: should include unitOfMeasure", () => {
      const formData: UpdateProductFormData = {
        unitOfMeasure: "kg",
      };

      const dto = toUpdateProductDto(formData);

      expect(dto.unitOfMeasure).toBe("kg");
    });

    it("Given: companyId defined but empty When: converting to DTO Then: should set to undefined", () => {
      const formData: UpdateProductFormData = {
        companyId: "",
      };

      const dto = toUpdateProductDto(formData);

      expect(dto.companyId).toBeUndefined();
    });

    it("Given: companyId with value When: converting to DTO Then: should include it", () => {
      const formData: UpdateProductFormData = {
        companyId: "comp-1",
      };

      const dto = toUpdateProductDto(formData);

      expect(dto.companyId).toBe("comp-1");
    });

    it("Given: no fields defined When: converting to DTO Then: should return empty object", () => {
      const formData: UpdateProductFormData = {};

      const dto = toUpdateProductDto(formData);

      expect(dto).toEqual({});
    });

    it("Given: all fields defined When: converting to DTO Then: should include all", () => {
      const formData: UpdateProductFormData = {
        name: "Updated",
        description: "Updated desc",
        categoryIds: ["cat-1"],
        unitOfMeasure: "pcs",
        price: 99,
        isActive: true,
        companyId: "comp-1",
      };

      const dto = toUpdateProductDto(formData);

      expect(dto.name).toBe("Updated");
      expect(dto.description).toBe("Updated desc");
      expect(dto.categoryIds).toEqual(["cat-1"]);
      expect(dto.unitOfMeasure).toBe("pcs");
      expect(dto.price).toBe(99);
      expect(dto.isActive).toBe(true);
      expect(dto.companyId).toBe("comp-1");
    });
  });

  describe("toCreateProductDto", () => {
    it("Given: form data with empty companyId When: converting to DTO Then: should set companyId to undefined", () => {
      const formData: CreateProductFormData = {
        sku: "PROD-001",
        name: "Test Product",
        unitOfMeasure: "unit",
        price: 20,
        companyId: "",
      };

      const dto = toCreateProductDto(formData);

      expect(dto.companyId).toBeUndefined();
    });

    it("Given: form data with companyId When: converting to DTO Then: should include companyId", () => {
      const formData: CreateProductFormData = {
        sku: "PROD-001",
        name: "Test Product",
        unitOfMeasure: "unit",
        price: 20,
        companyId: "comp-1",
      };

      const dto = toCreateProductDto(formData);

      expect(dto.companyId).toBe("comp-1");
    });
  });
});
