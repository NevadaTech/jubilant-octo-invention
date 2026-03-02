import { describe, it, expect } from "vitest";
import { Warehouse } from "@/modules/inventory/domain/entities/warehouse.entity";

describe("Warehouse Entity", () => {
  const now = new Date();

  const validProps = {
    id: "wh-001",
    code: "WH01",
    name: "Main Warehouse",
    address: "123 Storage Lane",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    statusChangedBy: null,
    statusChangedAt: null,
  };

  describe("create", () => {
    it("Given: valid props When: creating Then: should create with correct data", () => {
      // Arrange
      const props = { ...validProps };

      // Act
      const entity = Warehouse.create(props);

      // Assert
      expect(entity.id).toBe(props.id);
      expect(entity.code).toBe(props.code);
      expect(entity.name).toBe(props.name);
      expect(entity.address).toBe(props.address);
      expect(entity.isActive).toBe(true);
      expect(entity.createdAt).toBe(now);
      expect(entity.updatedAt).toBe(now);
    });
  });

  describe("displayName", () => {
    it("Given: a warehouse When: accessing displayName Then: should return code - name format", () => {
      // Arrange
      const entity = Warehouse.create({ ...validProps, code: "WH01", name: "Main Warehouse" });

      // Act
      const result = entity.displayName;

      // Assert
      expect(result).toBe("WH01 - Main Warehouse");
    });

    it("Given: different code and name When: accessing displayName Then: should format correctly", () => {
      // Arrange
      const entity = Warehouse.create({ ...validProps, code: "SEC02", name: "Secondary Depot" });

      // Act
      const result = entity.displayName;

      // Assert
      expect(result).toBe("SEC02 - Secondary Depot");
    });
  });

  describe("nullable fields", () => {
    it("Given: null address When: creating Then: should preserve null value", () => {
      // Arrange
      const props = { ...validProps, address: null };

      // Act
      const entity = Warehouse.create(props);

      // Assert
      expect(entity.address).toBeNull();
    });
  });

  describe("statusChanged fields", () => {
    it("Given: no statusChanged props When: creating Then: should default to null", () => {
      // Arrange
      const props = { ...validProps };

      // Act
      const entity = Warehouse.create(props);

      // Assert
      expect(entity.statusChangedBy).toBeNull();
      expect(entity.statusChangedAt).toBeNull();
    });

    it("Given: statusChanged props provided When: creating Then: should preserve values", () => {
      // Arrange
      const changedAt = new Date("2026-02-15T10:00:00Z");
      const props = {
        ...validProps,
        statusChangedBy: "user-admin-001",
        statusChangedAt: changedAt,
      };

      // Act
      const entity = Warehouse.create(props);

      // Assert
      expect(entity.statusChangedBy).toBe("user-admin-001");
      expect(entity.statusChangedAt).toBe(changedAt);
    });
  });
});
