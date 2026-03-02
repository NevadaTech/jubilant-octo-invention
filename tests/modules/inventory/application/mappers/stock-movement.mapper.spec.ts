import { describe, it, expect } from "vitest";
import { StockMovementMapper } from "@/modules/inventory/application/mappers/stock-movement.mapper";
import type { StockMovementResponseDto } from "@/modules/inventory/application/dto/stock-movement.dto";

describe("StockMovementMapper", () => {
  const mockLineDto = {
    id: "line-1",
    productId: "456e7890-e89b-12d3-a456-426614174000",
    productName: "Test Product",
    productSku: "PROD-001",
    quantity: 50,
    unitCost: 10.5,
    currency: "USD",
  };

  const mockMovementDto: StockMovementResponseDto = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    warehouseId: "789e0123-e89b-12d3-a456-426614174000",
    warehouseName: "Main Warehouse",
    type: "IN",
    status: "DRAFT",
    reference: "PO-2025-001",
    reason: "Stock replenishment",
    note: "Test note",
    lines: [mockLineDto],
    createdBy: "john.doe@example.com",
    createdAt: "2025-01-15T10:30:00.000Z",
    postedAt: null,
  };

  describe("lineToDomain", () => {
    it("Given: a valid MovementLineResponseDto When: mapping to domain Then: should return a MovementLine", () => {
      // Act
      const line = StockMovementMapper.lineToDomain(mockLineDto);

      // Assert
      expect(line.id).toBe(mockLineDto.id);
      expect(line.productId).toBe(mockLineDto.productId);
      expect(line.productName).toBe(mockLineDto.productName);
      expect(line.productSku).toBe(mockLineDto.productSku);
      expect(line.quantity).toBe(mockLineDto.quantity);
      expect(line.unitCost).toBe(mockLineDto.unitCost);
    });
  });

  describe("toDomain", () => {
    it("Given: a valid StockMovementResponseDto When: mapping to domain Then: should return a StockMovement entity", () => {
      // Act
      const movement = StockMovementMapper.toDomain(mockMovementDto);

      // Assert
      expect(movement.id).toBe(mockMovementDto.id);
      expect(movement.warehouseId).toBe(mockMovementDto.warehouseId);
      expect(movement.warehouseName).toBe(mockMovementDto.warehouseName);
      expect(movement.type).toBe(mockMovementDto.type);
      expect(movement.status).toBe(mockMovementDto.status);
      expect(movement.reference).toBe(mockMovementDto.reference);
      expect(movement.reason).toBe(mockMovementDto.reason);
      expect(movement.note).toBe(mockMovementDto.note);
      expect(movement.lines).toHaveLength(1);
      expect(movement.createdBy).toBe(mockMovementDto.createdBy);
      expect(movement.createdAt).toBeInstanceOf(Date);
    });

    it("Given: a movement with type IN When: mapping to domain Then: isEntry should be true", () => {
      // Act
      const movement = StockMovementMapper.toDomain(mockMovementDto);

      // Assert
      expect(movement.isEntry).toBe(true);
      expect(movement.isExit).toBe(false);
    });

    it("Given: a movement with type OUT When: mapping to domain Then: isExit should be true", () => {
      // Arrange
      const outDto: StockMovementResponseDto = {
        ...mockMovementDto,
        type: "OUT",
      };

      // Act
      const movement = StockMovementMapper.toDomain(outDto);

      // Assert
      expect(movement.isEntry).toBe(false);
      expect(movement.isExit).toBe(true);
    });

    it("Given: a movement without reference When: mapping to domain Then: reference should be null", () => {
      // Arrange
      const noRefDto: StockMovementResponseDto = {
        ...mockMovementDto,
        reference: null,
      };

      // Act
      const movement = StockMovementMapper.toDomain(noRefDto);

      // Assert
      expect(movement.reference).toBeNull();
    });

    it("Given: a movement with date string When: mapping to domain Then: should convert createdAt to Date", () => {
      // Act
      const movement = StockMovementMapper.toDomain(mockMovementDto);

      // Assert
      expect(movement.createdAt).toBeInstanceOf(Date);
      expect(movement.createdAt.toISOString()).toBe(mockMovementDto.createdAt);
    });
  });

  describe("toDto", () => {
    it("Given: a StockMovement entity When: mapping to DTO Then: should return correct DTO", () => {
      // Arrange
      const movement = StockMovementMapper.toDomain(mockMovementDto);

      // Act
      const dto = StockMovementMapper.toDto(movement);

      // Assert
      expect(dto.id).toBe(movement.id);
      expect(dto.warehouseId).toBe(movement.warehouseId);
      expect(dto.type).toBe(movement.type);
      expect(dto.status).toBe(movement.status);
      expect(typeof dto.createdAt).toBe("string");
    });
  });

  describe("round-trip", () => {
    it("Given: a StockMovementResponseDto When: mapping to domain and back to DTO Then: key fields should match", () => {
      // Act
      const movement = StockMovementMapper.toDomain(mockMovementDto);
      const resultDto = StockMovementMapper.toDto(movement);

      // Assert
      expect(resultDto.id).toBe(mockMovementDto.id);
      expect(resultDto.warehouseId).toBe(mockMovementDto.warehouseId);
      expect(resultDto.type).toBe(mockMovementDto.type);
      expect(resultDto.status).toBe(mockMovementDto.status);
      expect(resultDto.reference).toBe(mockMovementDto.reference);
      expect(resultDto.reason).toBe(mockMovementDto.reason);
      expect(resultDto.createdAt).toBe(mockMovementDto.createdAt);
    });
  });
});
