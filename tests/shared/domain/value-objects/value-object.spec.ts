import { describe, it, expect } from "vitest";
import { ValueObject } from "@/shared/domain/value-objects/value-object";

interface TestProps {
  value: string;
  count: number;
}

class TestValueObject extends ValueObject<TestProps> {
  constructor(props: TestProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  get count(): number {
    return this.props.count;
  }
}

describe("ValueObject", () => {
  describe("equals", () => {
    it("Given: two value objects with same props When: comparing equality Then: should return true", () => {
      // Arrange
      const vo1 = new TestValueObject({ value: "test", count: 1 });
      const vo2 = new TestValueObject({ value: "test", count: 1 });

      // Act
      const result = vo1.equals(vo2);

      // Assert
      expect(result).toBe(true);
    });

    it("Given: two value objects with different props When: comparing equality Then: should return false", () => {
      // Arrange
      const vo1 = new TestValueObject({ value: "test", count: 1 });
      const vo2 = new TestValueObject({ value: "test", count: 2 });

      // Act
      const result = vo1.equals(vo2);

      // Assert
      expect(result).toBe(false);
    });

    it("Given: value object compared with null When: comparing equality Then: should return false", () => {
      // Arrange
      const vo = new TestValueObject({ value: "test", count: 1 });

      // Act
      const result = vo.equals(null as unknown as TestValueObject);

      // Assert
      expect(result).toBe(false);
    });

    it("Given: value object compared with undefined When: comparing equality Then: should return false", () => {
      // Arrange
      const vo = new TestValueObject({ value: "test", count: 1 });

      // Act
      const result = vo.equals(undefined);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("immutability", () => {
    it("Given: value object created When: checking props Then: should be frozen", () => {
      // Arrange & Act
      const vo = new TestValueObject({ value: "test", count: 1 });

      // Assert
      expect(Object.isFrozen(vo["props"])).toBe(true);
    });
  });
});
