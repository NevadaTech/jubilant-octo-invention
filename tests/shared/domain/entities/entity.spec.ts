import { describe, it, expect } from "vitest";
import { Entity } from "@/shared/domain/entities/entity";

class TestEntity extends Entity<string> {
  constructor(id: string) {
    super(id);
  }
}

describe("Entity", () => {
  describe("equals", () => {
    it("Given: two entities with same id When: comparing equality Then: should return true", () => {
      // Arrange
      const entity1 = new TestEntity("123");
      const entity2 = new TestEntity("123");

      // Act
      const result = entity1.equals(entity2);

      // Assert
      expect(result).toBe(true);
    });

    it("Given: two entities with different id When: comparing equality Then: should return false", () => {
      // Arrange
      const entity1 = new TestEntity("123");
      const entity2 = new TestEntity("456");

      // Act
      const result = entity1.equals(entity2);

      // Assert
      expect(result).toBe(false);
    });

    it("Given: entity compared with null When: comparing equality Then: should return false", () => {
      // Arrange
      const entity = new TestEntity("123");

      // Act
      const result = entity.equals(null as unknown as TestEntity);

      // Assert
      expect(result).toBe(false);
    });

    it("Given: entity compared with undefined When: comparing equality Then: should return false", () => {
      // Arrange
      const entity = new TestEntity("123");

      // Act
      const result = entity.equals(undefined);

      // Assert
      expect(result).toBe(false);
    });

    it("Given: entity compared with itself When: comparing equality Then: should return true", () => {
      // Arrange
      const entity = new TestEntity("123");

      // Act
      const result = entity.equals(entity);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("id", () => {
    it("Given: entity with id When: accessing id Then: should return the id", () => {
      // Arrange
      const expectedId = "123";

      // Act
      const entity = new TestEntity(expectedId);

      // Assert
      expect(entity.id).toBe(expectedId);
    });
  });
});
