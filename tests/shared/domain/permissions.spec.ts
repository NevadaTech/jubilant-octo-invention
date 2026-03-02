import { describe, it, expect } from "vitest";
import { PERMISSIONS, ROUTE_PERMISSIONS } from "@/shared/domain/permissions";

describe("Permissions", () => {
  describe("PERMISSIONS constants", () => {
    it("Given: PERMISSIONS object When: checking format Then: all values should follow MODULE:ACTION pattern", () => {
      // Arrange
      const values = Object.values(PERMISSIONS);

      // Assert
      values.forEach((permission) => {
        expect(permission).toMatch(/^[A-Z_]+:[A-Z_]+$/);
      });
    });

    it("Given: PERMISSIONS object When: checking modules Then: should have all expected modules", () => {
      // Arrange
      const modules = new Set(
        Object.values(PERMISSIONS).map((p) => p.split(":")[0]),
      );

      // Assert
      expect(modules).toContain("USERS");
      expect(modules).toContain("ROLES");
      expect(modules).toContain("PRODUCTS");
      expect(modules).toContain("WAREHOUSES");
      expect(modules).toContain("INVENTORY");
      expect(modules).toContain("SALES");
      expect(modules).toContain("RETURNS");
      expect(modules).toContain("REPORTS");
      expect(modules).toContain("AUDIT");
      expect(modules).toContain("SETTINGS");
    });

    it("Given: PERMISSIONS object When: checking uniqueness Then: all values should be unique", () => {
      // Arrange
      const values = Object.values(PERMISSIONS);
      const uniqueValues = new Set(values);

      // Assert
      expect(uniqueValues.size).toBe(values.length);
    });

    it("Given: specific permission keys When: accessing Then: should return correct values", () => {
      // Assert
      expect(PERMISSIONS.USERS_CREATE).toBe("USERS:CREATE");
      expect(PERMISSIONS.PRODUCTS_READ).toBe("PRODUCTS:READ");
      expect(PERMISSIONS.SALES_CONFIRM).toBe("SALES:CONFIRM");
      expect(PERMISSIONS.INVENTORY_TRANSFER).toBe("INVENTORY:TRANSFER");
      expect(PERMISSIONS.SETTINGS_MANAGE).toBe("SETTINGS:MANAGE");
    });
  });

  describe("ROUTE_PERMISSIONS", () => {
    it("Given: dashboard route When: checking permissions Then: should be empty (always accessible)", () => {
      // Assert
      expect(ROUTE_PERMISSIONS["/dashboard"]).toEqual([]);
    });

    it("Given: settings route When: checking permissions Then: should be empty (always accessible)", () => {
      // Assert
      expect(ROUTE_PERMISSIONS["/dashboard/settings"]).toEqual([]);
    });

    it("Given: products route When: checking permissions Then: should require PRODUCTS_READ", () => {
      // Assert
      expect(ROUTE_PERMISSIONS["/dashboard/inventory/products"]).toContain(
        PERMISSIONS.PRODUCTS_READ,
      );
    });

    it("Given: sales route When: checking permissions Then: should require SALES_READ", () => {
      // Assert
      expect(ROUTE_PERMISSIONS["/dashboard/sales"]).toContain(
        PERMISSIONS.SALES_READ,
      );
    });

    it("Given: audit route When: checking permissions Then: should require AUDIT_READ", () => {
      // Assert
      expect(ROUTE_PERMISSIONS["/dashboard/audit"]).toContain(
        PERMISSIONS.AUDIT_READ,
      );
    });

    it("Given: all routes When: checking values Then: all permissions should exist in PERMISSIONS", () => {
      // Arrange
      const allPermissionValues = Object.values(PERMISSIONS);

      // Assert
      Object.values(ROUTE_PERMISSIONS).forEach((permissions) => {
        permissions.forEach((p) => {
          expect(allPermissionValues).toContain(p);
        });
      });
    });
  });
});
