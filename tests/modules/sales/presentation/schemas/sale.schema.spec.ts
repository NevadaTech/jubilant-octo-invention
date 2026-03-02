import { describe, it, expect } from "vitest";
import {
  saleLineSchema,
  createSaleSchema,
  addSaleLineSchema,
  toCreateSaleDto,
  type CreateSaleFormData,
} from "@/modules/sales/presentation/schemas/sale.schema";

describe("Sale Schema", () => {
  describe("saleLineSchema", () => {
    it("Given: valid line data When: validating Then: should pass validation", () => {
      // Arrange
      const validLine = {
        productId: "prod-123",
        quantity: 3,
        salePrice: 29.99,
      };

      // Act
      const result = saleLineSchema.safeParse(validLine);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: empty productId When: validating Then: should fail validation", () => {
      // Arrange
      const invalidLine = { productId: "", quantity: 1, salePrice: 10 };

      // Act
      const result = saleLineSchema.safeParse(invalidLine);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Please select a product");
      }
    });

    it("Given: zero quantity When: validating Then: should fail validation", () => {
      // Arrange
      const invalidLine = { productId: "prod-1", quantity: 0, salePrice: 10 };

      // Act
      const result = saleLineSchema.safeParse(invalidLine);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Quantity must be at least 1",
        );
      }
    });

    it("Given: zero salePrice When: validating Then: should fail validation", () => {
      // Arrange
      const invalidLine = { productId: "prod-1", quantity: 1, salePrice: 0 };

      // Act
      const result = saleLineSchema.safeParse(invalidLine);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Price must be greater than 0",
        );
      }
    });

    it("Given: optional currency When: validating Then: should pass validation", () => {
      // Arrange
      const validLine = {
        productId: "prod-1",
        quantity: 2,
        salePrice: 15.0,
        currency: "USD",
      };

      // Act
      const result = saleLineSchema.safeParse(validLine);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: negative salePrice When: validating Then: should fail validation", () => {
      // Arrange
      const invalidLine = {
        productId: "prod-1",
        quantity: 1,
        salePrice: -5.0,
      };

      // Act
      const result = saleLineSchema.safeParse(invalidLine);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe("createSaleSchema", () => {
    const validSale = {
      warehouseId: "wh-001",
      lines: [{ productId: "prod-1", quantity: 2, salePrice: 25.0 }],
    };

    it("Given: valid sale data with required fields When: validating Then: should pass validation", () => {
      // Act
      const result = createSaleSchema.safeParse(validSale);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: valid sale with all optional fields When: validating Then: should pass validation", () => {
      // Arrange
      const fullSale = {
        ...validSale,
        customerReference: "CUST-001",
        externalReference: "EXT-REF-123",
        note: "Rush order",
      };

      // Act
      const result = createSaleSchema.safeParse(fullSale);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: empty warehouseId When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = { ...validSale, warehouseId: "" };

      // Act
      const result = createSaleSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: empty lines array When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = { ...validSale, lines: [] };

      // Act
      const result = createSaleSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: missing lines field When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = { warehouseId: "wh-001" };

      // Act
      const result = createSaleSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe("addSaleLineSchema", () => {
    it("Given: valid add-line data When: validating Then: should pass validation", () => {
      // Arrange
      const validLine = {
        productId: "prod-1",
        quantity: 5,
        salePrice: 12.5,
      };

      // Act
      const result = addSaleLineSchema.safeParse(validLine);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: missing salePrice When: validating Then: should fail validation", () => {
      // Arrange
      const invalidLine = { productId: "prod-1", quantity: 5 };

      // Act
      const result = addSaleLineSchema.safeParse(invalidLine);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe("toCreateSaleDto", () => {
    it("Given: form data with all fields When: converting to DTO Then: should map all fields correctly", () => {
      // Arrange
      const formData: CreateSaleFormData = {
        warehouseId: "wh-001",
        customerReference: "CUST-001",
        externalReference: "EXT-123",
        note: "Important sale",
        lines: [
          { productId: "prod-1", quantity: 3, salePrice: 25.0 },
          {
            productId: "prod-2",
            quantity: 1,
            salePrice: 50.0,
            currency: "USD",
          },
        ],
      };

      // Act
      const dto = toCreateSaleDto(formData);

      // Assert
      expect(dto.warehouseId).toBe("wh-001");
      expect(dto.customerReference).toBe("CUST-001");
      expect(dto.externalReference).toBe("EXT-123");
      expect(dto.note).toBe("Important sale");
      expect(dto.lines).toHaveLength(2);
      expect(dto.lines[0].productId).toBe("prod-1");
      expect(dto.lines[0].quantity).toBe(3);
      expect(dto.lines[0].salePrice).toBe(25.0);
      expect(dto.lines[1].currency).toBe("USD");
    });

    it("Given: form data with empty optional strings When: converting to DTO Then: should set them as undefined", () => {
      // Arrange
      const formData: CreateSaleFormData = {
        warehouseId: "wh-001",
        customerReference: "",
        externalReference: "",
        note: "",
        lines: [{ productId: "prod-1", quantity: 1, salePrice: 10.0 }],
      };

      // Act
      const dto = toCreateSaleDto(formData);

      // Assert
      expect(dto.customerReference).toBeUndefined();
      expect(dto.externalReference).toBeUndefined();
      expect(dto.note).toBeUndefined();
    });

    it("Given: form data without optional fields When: converting to DTO Then: should set them as undefined", () => {
      // Arrange
      const formData: CreateSaleFormData = {
        warehouseId: "wh-001",
        lines: [{ productId: "prod-1", quantity: 1, salePrice: 10.0 }],
      };

      // Act
      const dto = toCreateSaleDto(formData);

      // Assert
      expect(dto.customerReference).toBeUndefined();
      expect(dto.externalReference).toBeUndefined();
      expect(dto.note).toBeUndefined();
    });
  });
});
