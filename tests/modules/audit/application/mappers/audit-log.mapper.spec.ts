import { describe, it, expect } from "vitest";
import { AuditLogMapper } from "@/modules/audit/application/mappers/audit-log.mapper";
import type { AuditLogResponseDto } from "@/modules/audit/application/dto/audit-log.dto";

describe("AuditLogMapper", () => {
  const mockDto: AuditLogResponseDto = {
    id: "log-1",
    orgId: "org-1",
    entityType: "Product",
    entityId: "prod-1",
    action: "CREATE",
    performedBy: "user-1",
    metadata: { field: "name", oldValue: "A", newValue: "B" },
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
    httpMethod: "POST",
    httpUrl: "/api/products",
    httpStatusCode: 201,
    duration: 150,
    createdAt: "2025-03-01T10:00:00.000Z",
  };

  describe("toDomain", () => {
    it("Given a valid AuditLogResponseDto, When toDomain is called, Then it should map all fields to an AuditLog entity", () => {
      // Arrange
      const dto = { ...mockDto };

      // Act
      const entity = AuditLogMapper.toDomain(dto);

      // Assert
      expect(entity.id).toBe("log-1");
      expect(entity.orgId).toBe("org-1");
      expect(entity.entityType).toBe("Product");
      expect(entity.entityId).toBe("prod-1");
      expect(entity.action).toBe("CREATE");
      expect(entity.performedBy).toBe("user-1");
      expect(entity.metadata).toEqual({
        field: "name",
        oldValue: "A",
        newValue: "B",
      });
      expect(entity.ipAddress).toBe("192.168.1.1");
      expect(entity.userAgent).toBe("Mozilla/5.0");
      expect(entity.httpMethod).toBe("POST");
      expect(entity.httpUrl).toBe("/api/products");
      expect(entity.httpStatusCode).toBe(201);
      expect(entity.duration).toBe(150);
    });

    it("Given a DTO with an ISO date string, When toDomain is called, Then createdAt should be converted to a Date object", () => {
      // Arrange
      const dto = { ...mockDto };

      // Act
      const entity = AuditLogMapper.toDomain(dto);

      // Assert
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.createdAt.toISOString()).toBe("2025-03-01T10:00:00.000Z");
    });

    it("Given a DTO with null metadata, When toDomain is called, Then metadata should default to an empty object", () => {
      // Arrange
      const dto: AuditLogResponseDto = {
        ...mockDto,
        metadata: null as unknown as Record<string, unknown>,
      };

      // Act
      const entity = AuditLogMapper.toDomain(dto);

      // Assert
      expect(entity.metadata).toEqual({});
    });

    it("Given a DTO with all nullable fields set to null, When toDomain is called, Then those fields should be null", () => {
      // Arrange
      const dto: AuditLogResponseDto = {
        id: "log-2",
        orgId: null,
        entityType: "Product",
        entityId: null,
        action: "READ",
        performedBy: null,
        metadata: {},
        ipAddress: null,
        userAgent: null,
        httpMethod: null,
        httpUrl: null,
        httpStatusCode: null,
        duration: null,
        createdAt: "2025-03-01T10:00:00.000Z",
      };

      // Act
      const entity = AuditLogMapper.toDomain(dto);

      // Assert
      expect(entity.orgId).toBeNull();
      expect(entity.entityId).toBeNull();
      expect(entity.performedBy).toBeNull();
      expect(entity.ipAddress).toBeNull();
      expect(entity.userAgent).toBeNull();
      expect(entity.httpMethod).toBeNull();
      expect(entity.httpUrl).toBeNull();
      expect(entity.httpStatusCode).toBeNull();
      expect(entity.duration).toBeNull();
    });

    it("Given a DTO with httpStatusCode 200, When toDomain is called, Then isSuccess should return true", () => {
      // Arrange
      const dto: AuditLogResponseDto = { ...mockDto, httpStatusCode: 200 };

      // Act
      const entity = AuditLogMapper.toDomain(dto);

      // Assert
      expect(entity.isSuccess).toBe(true);
      expect(entity.isError).toBe(false);
    });

    it("Given a DTO with httpStatusCode 500, When toDomain is called, Then isError should return true", () => {
      // Arrange
      const dto: AuditLogResponseDto = { ...mockDto, httpStatusCode: 500 };

      // Act
      const entity = AuditLogMapper.toDomain(dto);

      // Assert
      expect(entity.isError).toBe(true);
      expect(entity.isSuccess).toBe(false);
    });

    it("Given a DTO with httpMethod POST, When toDomain is called, Then isWriteOperation should return true", () => {
      // Arrange
      const dto: AuditLogResponseDto = { ...mockDto, httpMethod: "POST" };

      // Act
      const entity = AuditLogMapper.toDomain(dto);

      // Assert
      expect(entity.isWriteOperation).toBe(true);
      expect(entity.isReadOperation).toBe(false);
    });

    it("Given a DTO with httpMethod GET, When toDomain is called, Then isReadOperation should return true", () => {
      // Arrange
      const dto: AuditLogResponseDto = { ...mockDto, httpMethod: "GET" };

      // Act
      const entity = AuditLogMapper.toDomain(dto);

      // Assert
      expect(entity.isReadOperation).toBe(true);
      expect(entity.isWriteOperation).toBe(false);
    });

    it("Given a DTO with duration greater than 3000, When toDomain is called, Then isSlowRequest should return true", () => {
      // Arrange
      const dto: AuditLogResponseDto = { ...mockDto, duration: 5000 };

      // Act
      const entity = AuditLogMapper.toDomain(dto);

      // Assert
      expect(entity.isSlowRequest).toBe(true);
    });

    it("Given a DTO with duration less than 3000, When toDomain is called, Then isSlowRequest should return false", () => {
      // Arrange
      const dto: AuditLogResponseDto = { ...mockDto, duration: 150 };

      // Act
      const entity = AuditLogMapper.toDomain(dto);

      // Assert
      expect(entity.isSlowRequest).toBe(false);
    });
  });
});
