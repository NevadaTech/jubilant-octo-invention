import { describe, it, expect } from "vitest";
import { WarehouseMapper } from "@/modules/inventory/application/mappers/warehouse.mapper";
import type { WarehouseResponseDto } from "@/modules/inventory/application/dto/warehouse.dto";

describe("WarehouseMapper", () => {
  const mockDto: WarehouseResponseDto = {
    id: "wh-001",
    code: "WH-MAIN",
    name: "Main Warehouse",
    address: "123 Main St",
    isActive: true,
    createdAt: "2025-01-15T10:30:00.000Z",
    updatedAt: "2025-01-16T14:20:00.000Z",
    statusChangedBy: null,
    statusChangedAt: null,
  };

  describe("toDomain", () => {
    it("Given a valid WarehouseResponseDto, When toDomain is called, Then it should map all fields to a Warehouse entity", () => {
      // Arrange
      const dto = { ...mockDto };

      // Act
      const entity = WarehouseMapper.toDomain(dto);

      // Assert
      expect(entity.id).toBe("wh-001");
      expect(entity.code).toBe("WH-MAIN");
      expect(entity.name).toBe("Main Warehouse");
      expect(entity.address).toBe("123 Main St");
      expect(entity.isActive).toBe(true);
    });

    it("Given a DTO with ISO date strings, When toDomain is called, Then dates should be converted to Date objects", () => {
      // Arrange
      const dto = { ...mockDto };

      // Act
      const entity = WarehouseMapper.toDomain(dto);

      // Assert
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);
      expect(entity.createdAt.toISOString()).toBe("2025-01-15T10:30:00.000Z");
      expect(entity.updatedAt.toISOString()).toBe("2025-01-16T14:20:00.000Z");
    });

    it("Given a DTO with null address, When toDomain is called, Then address should be null in the entity", () => {
      // Arrange
      const dto: WarehouseResponseDto = { ...mockDto, address: null };

      // Act
      const entity = WarehouseMapper.toDomain(dto);

      // Assert
      expect(entity.address).toBeNull();
    });

    it("Given a DTO with null statusChangedBy and statusChangedAt, When toDomain is called, Then those fields should be null", () => {
      // Arrange
      const dto = { ...mockDto };

      // Act
      const entity = WarehouseMapper.toDomain(dto);

      // Assert
      expect(entity.statusChangedBy).toBeNull();
      expect(entity.statusChangedAt).toBeNull();
    });
  });

  describe("toDto", () => {
    it("Given a Warehouse entity, When toDto is called, Then it should map all fields back to a DTO", () => {
      // Arrange
      const entity = WarehouseMapper.toDomain(mockDto);

      // Act
      const dto = WarehouseMapper.toDto(entity);

      // Assert
      expect(dto.id).toBe("wh-001");
      expect(dto.code).toBe("WH-MAIN");
      expect(dto.name).toBe("Main Warehouse");
      expect(dto.address).toBe("123 Main St");
      expect(dto.isActive).toBe(true);
    });

    it("Given a Warehouse entity, When toDto is called, Then dates should be converted to ISO strings", () => {
      // Arrange
      const entity = WarehouseMapper.toDomain(mockDto);

      // Act
      const dto = WarehouseMapper.toDto(entity);

      // Assert
      expect(typeof dto.createdAt).toBe("string");
      expect(typeof dto.updatedAt).toBe("string");
      expect(dto.createdAt).toBe("2025-01-15T10:30:00.000Z");
      expect(dto.updatedAt).toBe("2025-01-16T14:20:00.000Z");
    });
  });

  describe("round-trip", () => {
    it("Given a DTO, When mapped to domain and back to DTO, Then it should produce an equivalent DTO", () => {
      // Arrange
      const originalDto = { ...mockDto };

      // Act
      const entity = WarehouseMapper.toDomain(originalDto);
      const resultDto = WarehouseMapper.toDto(entity);

      // Assert
      expect(resultDto.id).toBe(originalDto.id);
      expect(resultDto.code).toBe(originalDto.code);
      expect(resultDto.name).toBe(originalDto.name);
      expect(resultDto.address).toBe(originalDto.address);
      expect(resultDto.isActive).toBe(originalDto.isActive);
      expect(resultDto.createdAt).toBe(originalDto.createdAt);
      expect(resultDto.updatedAt).toBe(originalDto.updatedAt);
      expect(resultDto.statusChangedBy).toBe(originalDto.statusChangedBy);
      expect(resultDto.statusChangedAt).toBe(originalDto.statusChangedAt);
    });

    it("Given a DTO with null address, When round-tripped, Then null address should be preserved", () => {
      // Arrange
      const dtoWithNullAddress: WarehouseResponseDto = {
        ...mockDto,
        address: null,
      };

      // Act
      const entity = WarehouseMapper.toDomain(dtoWithNullAddress);
      const resultDto = WarehouseMapper.toDto(entity);

      // Assert
      expect(resultDto.address).toBeNull();
    });
  });
});
