import { describe, it, expect } from "vitest";
import { StockMovementMapper } from "@/modules/inventory/application/mappers/stock-movement.mapper";
import type { StockMovementResponseDto } from "@/modules/inventory/application/dto/stock-movement.dto";

describe("StockMovementMapper", () => {
  const mockMovementDto: StockMovementResponseDto = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    productId: "456e7890-e89b-12d3-a456-426614174000",
    productName: "Test Product",
    productSku: "PROD-001",
    warehouseId: "789e0123-e89b-12d3-a456-426614174000",
    warehouseName: "Main Warehouse",
    type: "IN",
    quantity: 50,
    previousQuantity: 100,
    newQuantity: 150,
    reason: "Stock replenishment",
    reference: "PO-2025-001",
    createdBy: "john.doe@example.com",
    createdAt: "2025-01-15T10:30:00.000Z",
  };

  describe("toDomain", () => {
    it("Given: a valid StockMovementResponseDto When: mapping to domain Then: should return a StockMovement entity", () => {
      // Act
      const movement = StockMovementMapper.toDomain(mockMovementDto);

      // Assert
      expect(movement.id).toBe(mockMovementDto.id);
      expect(movement.productId).toBe(mockMovementDto.productId);
      expect(movement.productName).toBe(mockMovementDto.productName);
      expect(movement.productSku).toBe(mockMovementDto.productSku);
      expect(movement.warehouseId).toBe(mockMovementDto.warehouseId);
      expect(movement.warehouseName).toBe(mockMovementDto.warehouseName);
      expect(movement.type).toBe(mockMovementDto.type);
      expect(movement.quantity).toBe(mockMovementDto.quantity);
      expect(movement.previousQuantity).toBe(mockMovementDto.previousQuantity);
      expect(movement.newQuantity).toBe(mockMovementDto.newQuantity);
      expect(movement.reason).toBe(mockMovementDto.reason);
      expect(movement.reference).toBe(mockMovementDto.reference);
      expect(movement.createdBy).toBe(mockMovementDto.createdBy);
    });

    it("Given: a movement with type IN When: mapping to domain Then: isEntry should be true", () => {
      // Arrange
      const inMovementDto: StockMovementResponseDto = {
        ...mockMovementDto,
        type: "IN",
      };

      // Act
      const movement = StockMovementMapper.toDomain(inMovementDto);

      // Assert
      expect(movement.isEntry).toBe(true);
      expect(movement.isExit).toBe(false);
      expect(movement.isAdjustment).toBe(false);
    });

    it("Given: a movement with type OUT When: mapping to domain Then: isExit should be true", () => {
      // Arrange
      const outMovementDto: StockMovementResponseDto = {
        ...mockMovementDto,
        type: "OUT",
      };

      // Act
      const movement = StockMovementMapper.toDomain(outMovementDto);

      // Assert
      expect(movement.isEntry).toBe(false);
      expect(movement.isExit).toBe(true);
      expect(movement.isAdjustment).toBe(false);
    });

    it("Given: a movement with type ADJUSTMENT When: mapping to domain Then: isAdjustment should be true", () => {
      // Arrange
      const adjustmentDto: StockMovementResponseDto = {
        ...mockMovementDto,
        type: "ADJUSTMENT",
      };

      // Act
      const movement = StockMovementMapper.toDomain(adjustmentDto);

      // Assert
      expect(movement.isEntry).toBe(false);
      expect(movement.isExit).toBe(false);
      expect(movement.isAdjustment).toBe(true);
    });

    it("Given: a movement When: getting quantityDifference Then: should return correct difference", () => {
      // Act
      const movement = StockMovementMapper.toDomain(mockMovementDto);

      // Assert
      expect(movement.quantityDifference).toBe(50); // 150 - 100
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
  });

  describe("toDto", () => {
    it("Given: a StockMovement entity When: mapping to DTO Then: should return a StockMovementResponseDto", () => {
      // Arrange
      const movement = StockMovementMapper.toDomain(mockMovementDto);

      // Act
      const dto = StockMovementMapper.toDto(movement);

      // Assert
      expect(dto.id).toBe(movement.id);
      expect(dto.productId).toBe(movement.productId);
      expect(dto.type).toBe(movement.type);
      expect(dto.quantity).toBe(movement.quantity);
    });
  });

  describe("round-trip", () => {
    it("Given: a StockMovementResponseDto When: mapping to domain and back to DTO Then: should be equivalent", () => {
      // Act
      const movement = StockMovementMapper.toDomain(mockMovementDto);
      const resultDto = StockMovementMapper.toDto(movement);

      // Assert
      expect(resultDto).toEqual(mockMovementDto);
    });
  });
});
