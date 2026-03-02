import { describe, it, expect } from "vitest";
import { AuditLog } from "@/modules/audit/domain/entities/audit-log.entity";

describe("AuditLog Entity", () => {
  const validProps = {
    id: "log-1",
    orgId: "org-1",
    entityType: "Product",
    entityId: "prod-1",
    action: "CREATE",
    performedBy: "user-1",
    metadata: { field: "name" },
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
    httpMethod: "POST",
    httpUrl: "/api/products",
    httpStatusCode: 201,
    duration: 150,
    createdAt: new Date("2025-03-01T10:00:00.000Z"),
  };

  describe("create", () => {
    it("Given valid props, When AuditLog.create is called, Then it creates an AuditLog entity with all properties", () => {
      // Arrange
      const props = { ...validProps };

      // Act
      const log = AuditLog.create(props);

      // Assert
      expect(log).toBeInstanceOf(AuditLog);
      expect(log.id).toBe("log-1");
      expect(log.orgId).toBe("org-1");
      expect(log.entityType).toBe("Product");
      expect(log.entityId).toBe("prod-1");
      expect(log.action).toBe("CREATE");
      expect(log.performedBy).toBe("user-1");
      expect(log.metadata).toEqual({ field: "name" });
      expect(log.ipAddress).toBe("192.168.1.1");
      expect(log.userAgent).toBe("Mozilla/5.0");
      expect(log.httpMethod).toBe("POST");
      expect(log.httpUrl).toBe("/api/products");
      expect(log.httpStatusCode).toBe(201);
      expect(log.duration).toBe(150);
      expect(log.createdAt).toEqual(new Date("2025-03-01T10:00:00.000Z"));
    });
  });

  describe("isSuccess", () => {
    it("Given an AuditLog with httpStatusCode 200, When isSuccess is accessed, Then it returns true", () => {
      // Arrange
      const log = AuditLog.create({ ...validProps, httpStatusCode: 200 });

      // Act & Assert
      expect(log.isSuccess).toBe(true);
    });

    it("Given an AuditLog with httpStatusCode 201, When isSuccess is accessed, Then it returns true", () => {
      // Arrange
      const log = AuditLog.create({ ...validProps, httpStatusCode: 201 });

      // Act & Assert
      expect(log.isSuccess).toBe(true);
    });

    it("Given an AuditLog with httpStatusCode 399, When isSuccess is accessed, Then it returns true", () => {
      // Arrange
      const log = AuditLog.create({ ...validProps, httpStatusCode: 399 });

      // Act & Assert
      expect(log.isSuccess).toBe(true);
    });

    it("Given an AuditLog with null httpStatusCode, When isSuccess is accessed, Then it returns false", () => {
      // Arrange
      const log = AuditLog.create({ ...validProps, httpStatusCode: null });

      // Act & Assert
      expect(log.isSuccess).toBe(false);
    });
  });

  describe("isError", () => {
    it("Given an AuditLog with httpStatusCode 400, When isError is accessed, Then it returns true", () => {
      // Arrange
      const log = AuditLog.create({ ...validProps, httpStatusCode: 400 });

      // Act & Assert
      expect(log.isError).toBe(true);
    });

    it("Given an AuditLog with httpStatusCode 500, When isError is accessed, Then it returns true", () => {
      // Arrange
      const log = AuditLog.create({ ...validProps, httpStatusCode: 500 });

      // Act & Assert
      expect(log.isError).toBe(true);
    });

    it("Given an AuditLog with httpStatusCode 200, When isError is accessed, Then it returns false", () => {
      // Arrange
      const log = AuditLog.create({ ...validProps, httpStatusCode: 200 });

      // Act & Assert
      expect(log.isError).toBe(false);
    });

    it("Given an AuditLog with null httpStatusCode, When isError is accessed, Then it returns false", () => {
      // Arrange
      const log = AuditLog.create({ ...validProps, httpStatusCode: null });

      // Act & Assert
      expect(log.isError).toBe(false);
    });
  });

  describe("isWriteOperation", () => {
    it("Given an AuditLog with POST httpMethod, When isWriteOperation is accessed, Then it returns true", () => {
      // Arrange
      const log = AuditLog.create({ ...validProps, httpMethod: "POST" });

      // Act & Assert
      expect(log.isWriteOperation).toBe(true);
    });

    it("Given an AuditLog with PUT httpMethod, When isWriteOperation is accessed, Then it returns true", () => {
      // Arrange
      const log = AuditLog.create({ ...validProps, httpMethod: "PUT" });

      // Act & Assert
      expect(log.isWriteOperation).toBe(true);
    });

    it("Given an AuditLog with PATCH httpMethod, When isWriteOperation is accessed, Then it returns true", () => {
      // Arrange
      const log = AuditLog.create({ ...validProps, httpMethod: "PATCH" });

      // Act & Assert
      expect(log.isWriteOperation).toBe(true);
    });

    it("Given an AuditLog with DELETE httpMethod, When isWriteOperation is accessed, Then it returns true", () => {
      // Arrange
      const log = AuditLog.create({ ...validProps, httpMethod: "DELETE" });

      // Act & Assert
      expect(log.isWriteOperation).toBe(true);
    });

    it("Given an AuditLog with GET httpMethod, When isWriteOperation is accessed, Then it returns false", () => {
      // Arrange
      const log = AuditLog.create({ ...validProps, httpMethod: "GET" });

      // Act & Assert
      expect(log.isWriteOperation).toBe(false);
    });

    it("Given an AuditLog with null httpMethod, When isWriteOperation is accessed, Then it returns false", () => {
      // Arrange
      const log = AuditLog.create({ ...validProps, httpMethod: null });

      // Act & Assert
      expect(log.isWriteOperation).toBe(false);
    });
  });

  describe("isReadOperation", () => {
    it("Given an AuditLog with GET httpMethod, When isReadOperation is accessed, Then it returns true", () => {
      // Arrange
      const log = AuditLog.create({ ...validProps, httpMethod: "GET" });

      // Act & Assert
      expect(log.isReadOperation).toBe(true);
    });

    it("Given an AuditLog with POST httpMethod, When isReadOperation is accessed, Then it returns false", () => {
      // Arrange
      const log = AuditLog.create({ ...validProps, httpMethod: "POST" });

      // Act & Assert
      expect(log.isReadOperation).toBe(false);
    });
  });

  describe("isSlowRequest", () => {
    it("Given an AuditLog with duration 5000ms, When isSlowRequest is accessed, Then it returns true", () => {
      // Arrange
      const log = AuditLog.create({ ...validProps, duration: 5000 });

      // Act & Assert
      expect(log.isSlowRequest).toBe(true);
    });

    it("Given an AuditLog with duration 100ms, When isSlowRequest is accessed, Then it returns false", () => {
      // Arrange
      const log = AuditLog.create({ ...validProps, duration: 100 });

      // Act & Assert
      expect(log.isSlowRequest).toBe(false);
    });

    it("Given an AuditLog with duration exactly 3000ms, When isSlowRequest is accessed, Then it returns false", () => {
      // Arrange
      const log = AuditLog.create({ ...validProps, duration: 3000 });

      // Act & Assert
      expect(log.isSlowRequest).toBe(false);
    });

    it("Given an AuditLog with duration 3001ms, When isSlowRequest is accessed, Then it returns true", () => {
      // Arrange
      const log = AuditLog.create({ ...validProps, duration: 3001 });

      // Act & Assert
      expect(log.isSlowRequest).toBe(true);
    });
  });
});
