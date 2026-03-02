import { describe, it, expect } from "vitest";
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from "@/shared/domain/errors/domain-error";

describe("Domain Errors", () => {
  describe("ValidationError", () => {
    it("Given: a validation message When: creating error Then: should have correct properties", () => {
      // Arrange
      const message = "Invalid email format";
      const field = "email";

      // Act
      const error = new ValidationError(message, field);

      // Assert
      expect(error.message).toBe(message);
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.field).toBe(field);
      expect(error.name).toBe("ValidationError");
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error).toBeInstanceOf(Error);
    });

    it("Given: a validation message without field When: creating error Then: field should be undefined", () => {
      // Arrange
      const message = "General validation failed";

      // Act
      const error = new ValidationError(message);

      // Assert
      expect(error.message).toBe(message);
      expect(error.field).toBeUndefined();
    });
  });

  describe("NotFoundError", () => {
    it("Given: entity name and id When: creating error Then: should build correct message", () => {
      // Arrange
      const entityName = "Product";
      const entityId = "prod-123";

      // Act
      const error = new NotFoundError(entityName, entityId);

      // Assert
      expect(error.message).toBe("Product with id prod-123 not found");
      expect(error.code).toBe("NOT_FOUND");
      expect(error.entityName).toBe(entityName);
      expect(error.entityId).toBe(entityId);
      expect(error.name).toBe("NotFoundError");
    });
  });

  describe("UnauthorizedError", () => {
    it("Given: no message When: creating error Then: should use default message", () => {
      // Act
      const error = new UnauthorizedError();

      // Assert
      expect(error.message).toBe("Unauthorized access");
      expect(error.code).toBe("UNAUTHORIZED");
      expect(error.name).toBe("UnauthorizedError");
    });

    it("Given: custom message When: creating error Then: should use custom message", () => {
      // Arrange
      const message = "Session expired";

      // Act
      const error = new UnauthorizedError(message);

      // Assert
      expect(error.message).toBe(message);
    });
  });

  describe("ForbiddenError", () => {
    it("Given: no message When: creating error Then: should use default message", () => {
      // Act
      const error = new ForbiddenError();

      // Assert
      expect(error.message).toBe("Access forbidden");
      expect(error.code).toBe("FORBIDDEN");
      expect(error.name).toBe("ForbiddenError");
    });

    it("Given: custom message When: creating error Then: should use custom message", () => {
      // Arrange
      const message = "Insufficient permissions";

      // Act
      const error = new ForbiddenError(message);

      // Assert
      expect(error.message).toBe(message);
    });
  });

  describe("ConflictError", () => {
    it("Given: a conflict message When: creating error Then: should have correct properties", () => {
      // Arrange
      const message = "SKU already exists";

      // Act
      const error = new ConflictError(message);

      // Assert
      expect(error.message).toBe(message);
      expect(error.code).toBe("CONFLICT");
      expect(error.name).toBe("ConflictError");
    });
  });
});
