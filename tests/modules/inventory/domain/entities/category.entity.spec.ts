import { describe, it, expect } from "vitest";
import { Category } from "@/modules/inventory/domain/entities/category.entity";

describe("Category Entity", () => {
  const now = new Date();

  const validProps = {
    id: "cat-001",
    name: "Electronics",
    description: "Electronic products",
    parentId: "cat-parent",
    parentName: "Root Category",
    isActive: true,
    productCount: 10,
    createdAt: now,
    updatedAt: now,
  };

  describe("create", () => {
    it("Given: valid props When: creating Then: should create with correct data", () => {
      // Arrange
      const props = { ...validProps };

      // Act
      const entity = Category.create(props);

      // Assert
      expect(entity.id).toBe(props.id);
      expect(entity.name).toBe(props.name);
      expect(entity.description).toBe(props.description);
      expect(entity.parentId).toBe(props.parentId);
      expect(entity.parentName).toBe(props.parentName);
      expect(entity.isActive).toBe(true);
      expect(entity.productCount).toBe(10);
      expect(entity.createdAt).toBe(now);
      expect(entity.updatedAt).toBe(now);
    });
  });

  describe("hasParent", () => {
    it("Given: category with parentId When: checking hasParent Then: should return true", () => {
      // Arrange
      const entity = Category.create({ ...validProps, parentId: "cat-parent" });

      // Act
      const result = entity.hasParent;

      // Assert
      expect(result).toBe(true);
    });

    it("Given: category without parentId When: checking hasParent Then: should return false", () => {
      // Arrange
      const entity = Category.create({ ...validProps, parentId: null });

      // Act
      const result = entity.hasParent;

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("hasProducts", () => {
    it("Given: category with products When: checking hasProducts Then: should return true", () => {
      // Arrange
      const entity = Category.create({ ...validProps, productCount: 5 });

      // Act
      const result = entity.hasProducts;

      // Assert
      expect(result).toBe(true);
    });

    it("Given: category with zero products When: checking hasProducts Then: should return false", () => {
      // Arrange
      const entity = Category.create({ ...validProps, productCount: 0 });

      // Act
      const result = entity.hasProducts;

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("canDelete", () => {
    it("Given: category with zero products When: checking canDelete Then: should return true", () => {
      // Arrange
      const entity = Category.create({ ...validProps, productCount: 0 });

      // Act
      const result = entity.canDelete;

      // Assert
      expect(result).toBe(true);
    });

    it("Given: category with products When: checking canDelete Then: should return false", () => {
      // Arrange
      const entity = Category.create({ ...validProps, productCount: 3 });

      // Act
      const result = entity.canDelete;

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("isRoot", () => {
    it("Given: category without parentId When: checking isRoot Then: should return true", () => {
      // Arrange
      const entity = Category.create({ ...validProps, parentId: null });

      // Act
      const result = entity.isRoot;

      // Assert
      expect(result).toBe(true);
    });

    it("Given: category with parentId When: checking isRoot Then: should return false", () => {
      // Arrange
      const entity = Category.create({ ...validProps, parentId: "cat-parent" });

      // Act
      const result = entity.isRoot;

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("nullable fields", () => {
    it("Given: null description When: creating Then: should preserve null value", () => {
      // Arrange
      const props = { ...validProps, description: null };

      // Act
      const entity = Category.create(props);

      // Assert
      expect(entity.description).toBeNull();
    });

    it("Given: null parentName When: creating Then: should preserve null value", () => {
      // Arrange
      const props = { ...validProps, parentId: null, parentName: null };

      // Act
      const entity = Category.create(props);

      // Assert
      expect(entity.parentName).toBeNull();
    });
  });
});
