import { describe, it, expect } from "vitest";
import { cn, isDefined, capitalize, truncate } from "@/lib/utils";

describe("Utils", () => {
  describe("cn", () => {
    it("Given: multiple class names When: merging Then: should return merged string", () => {
      // Arrange
      const classes = ["px-4", "py-2"];

      // Act
      const result = cn(...classes);

      // Assert
      expect(result).toBe("px-4 py-2");
    });

    it("Given: conditional classes When: merging Then: should only include truthy classes", () => {
      // Arrange
      const base = "base";
      const included = true && "included";
      const excluded = false && "excluded";

      // Act
      const result = cn(base, included, excluded);

      // Assert
      expect(result).toBe("base included");
    });

    it("Given: conflicting tailwind classes When: merging Then: should keep the last one", () => {
      // Arrange
      const firstPadding = "px-4";
      const secondPadding = "px-6";

      // Act
      const result = cn(firstPadding, secondPadding);

      // Assert
      expect(result).toBe("px-6");
    });
  });

  describe("isDefined", () => {
    it("Given: defined string value When: checking Then: should return true", () => {
      // Arrange
      const value = "value";

      // Act
      const result = isDefined(value);

      // Assert
      expect(result).toBe(true);
    });

    it("Given: zero value When: checking Then: should return true", () => {
      // Arrange
      const value = 0;

      // Act
      const result = isDefined(value);

      // Assert
      expect(result).toBe(true);
    });

    it("Given: false value When: checking Then: should return true", () => {
      // Arrange
      const value = false;

      // Act
      const result = isDefined(value);

      // Assert
      expect(result).toBe(true);
    });

    it("Given: null value When: checking Then: should return false", () => {
      // Arrange
      const value = null;

      // Act
      const result = isDefined(value);

      // Assert
      expect(result).toBe(false);
    });

    it("Given: undefined value When: checking Then: should return false", () => {
      // Arrange
      const value = undefined;

      // Act
      const result = isDefined(value);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("capitalize", () => {
    it("Given: lowercase string When: capitalizing Then: should capitalize first letter", () => {
      // Arrange
      const input = "hello";

      // Act
      const result = capitalize(input);

      // Assert
      expect(result).toBe("Hello");
    });

    it("Given: empty string When: capitalizing Then: should return empty string", () => {
      // Arrange
      const input = "";

      // Act
      const result = capitalize(input);

      // Assert
      expect(result).toBe("");
    });

    it("Given: already capitalized string When: capitalizing Then: should remain the same", () => {
      // Arrange
      const input = "Hello";

      // Act
      const result = capitalize(input);

      // Assert
      expect(result).toBe("Hello");
    });
  });

  describe("truncate", () => {
    it("Given: long string When: truncating Then: should truncate with default suffix", () => {
      // Arrange
      const input = "Hello World";
      const maxLength = 8;

      // Act
      const result = truncate(input, maxLength);

      // Assert
      expect(result).toBe("Hello...");
    });

    it("Given: short string When: truncating Then: should return original string", () => {
      // Arrange
      const input = "Hello";
      const maxLength = 10;

      // Act
      const result = truncate(input, maxLength);

      // Assert
      expect(result).toBe("Hello");
    });

    it("Given: long string and custom suffix When: truncating Then: should use custom suffix", () => {
      // Arrange
      const input = "Hello World";
      const maxLength = 8;
      const suffix = "…";

      // Act
      const result = truncate(input, maxLength, suffix);

      // Assert
      expect(result).toBe("Hello W…");
    });
  });
});
