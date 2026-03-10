import { describe, it, expect } from "vitest";
import {
  Company,
  type CompanyProps,
} from "@/modules/companies/domain/entities/company.entity";

describe("Company Entity", () => {
  const now = new Date("2026-03-07T10:00:00.000Z");

  const validProps: CompanyProps = {
    id: "company-001",
    name: "Acme Corp",
    code: "ACME",
    description: "Main company",
    isActive: true,
    productCount: 10,
    createdAt: now,
    updatedAt: now,
  };

  describe("create", () => {
    it("Given: valid props When: creating Then: should create with correct data", () => {
      const entity = Company.create(validProps);

      expect(entity.id).toBe("company-001");
      expect(entity.name).toBe("Acme Corp");
      expect(entity.code).toBe("ACME");
      expect(entity.description).toBe("Main company");
      expect(entity.isActive).toBe(true);
      expect(entity.productCount).toBe(10);
      expect(entity.createdAt).toEqual(now);
      expect(entity.updatedAt).toEqual(now);
    });

    it("Given: null description When: creating Then: should preserve null", () => {
      const entity = Company.create({ ...validProps, description: null });

      expect(entity.description).toBeNull();
    });

    it("Given: zero productCount When: creating Then: should store zero", () => {
      const entity = Company.create({ ...validProps, productCount: 0 });

      expect(entity.productCount).toBe(0);
    });

    it("Given: inactive company When: creating Then: should store false", () => {
      const entity = Company.create({ ...validProps, isActive: false });

      expect(entity.isActive).toBe(false);
    });
  });

  describe("hasProducts", () => {
    it("Given: productCount > 0 When: checking hasProducts Then: should return true", () => {
      const entity = Company.create({ ...validProps, productCount: 5 });

      expect(entity.hasProducts).toBe(true);
    });

    it("Given: productCount === 0 When: checking hasProducts Then: should return false", () => {
      const entity = Company.create({ ...validProps, productCount: 0 });

      expect(entity.hasProducts).toBe(false);
    });
  });

  describe("canDelete", () => {
    it("Given: productCount === 0 When: checking canDelete Then: should return true", () => {
      const entity = Company.create({ ...validProps, productCount: 0 });

      expect(entity.canDelete).toBe(true);
    });

    it("Given: productCount > 0 When: checking canDelete Then: should return false", () => {
      const entity = Company.create({ ...validProps, productCount: 3 });

      expect(entity.canDelete).toBe(false);
    });
  });
});
