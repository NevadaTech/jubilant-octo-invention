import { describe, it, expect } from "vitest";
import { CompanyMapper } from "@/modules/companies/application/mappers/company.mapper";
import { Company } from "@/modules/companies/domain/entities/company.entity";
import type { CompanyResponseDto } from "@/modules/companies/application/dto/company.dto";

describe("CompanyMapper", () => {
  const mockDto: CompanyResponseDto = {
    id: "company-001",
    name: "Acme Corp",
    code: "ACME",
    description: "Main company",
    isActive: true,
    productCount: 10,
    createdAt: "2026-03-07T10:00:00.000Z",
    updatedAt: "2026-03-07T12:00:00.000Z",
  };

  describe("toDomain", () => {
    it("Given: valid DTO When: mapping Then: should return Company entity with correct values", () => {
      const company = CompanyMapper.toDomain(mockDto);

      expect(company.id).toBe("company-001");
      expect(company.name).toBe("Acme Corp");
      expect(company.code).toBe("ACME");
      expect(company.description).toBe("Main company");
      expect(company.isActive).toBe(true);
      expect(company.productCount).toBe(10);
    });

    it("Given: date strings When: mapping Then: should convert to Date objects", () => {
      const company = CompanyMapper.toDomain(mockDto);

      expect(company.createdAt).toBeInstanceOf(Date);
      expect(company.updatedAt).toBeInstanceOf(Date);
      expect(company.createdAt.toISOString()).toBe("2026-03-07T10:00:00.000Z");
      expect(company.updatedAt.toISOString()).toBe("2026-03-07T12:00:00.000Z");
    });

    it("Given: null description When: mapping Then: should preserve null", () => {
      const dto: CompanyResponseDto = { ...mockDto, description: null };

      const company = CompanyMapper.toDomain(dto);

      expect(company.description).toBeNull();
    });

    it("Given: non-string description (undefined) When: mapping Then: should default to null", () => {
      const dto = { ...mockDto } as CompanyResponseDto;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (dto as any).description;

      const company = CompanyMapper.toDomain(dto);

      expect(company.description).toBeNull();
    });

    it("Given: string description When: mapping Then: should keep the string", () => {
      const dto: CompanyResponseDto = { ...mockDto, description: "Test desc" };

      const company = CompanyMapper.toDomain(dto);

      expect(company.description).toBe("Test desc");
    });
  });

  describe("toDto", () => {
    it("Given: Company entity When: mapping to DTO Then: should return correct DTO", () => {
      const entity = Company.create({
        id: "company-001",
        name: "Acme Corp",
        code: "ACME",
        description: "Main company",
        isActive: true,
        productCount: 10,
        createdAt: new Date("2026-03-07T10:00:00.000Z"),
        updatedAt: new Date("2026-03-07T12:00:00.000Z"),
      });

      const dto = CompanyMapper.toDto(entity);

      expect(dto.id).toBe("company-001");
      expect(dto.name).toBe("Acme Corp");
      expect(dto.code).toBe("ACME");
      expect(dto.description).toBe("Main company");
      expect(dto.isActive).toBe(true);
      expect(dto.productCount).toBe(10);
      expect(dto.createdAt).toBe("2026-03-07T10:00:00.000Z");
      expect(dto.updatedAt).toBe("2026-03-07T12:00:00.000Z");
    });

    it("Given: entity with null description When: mapping to DTO Then: should preserve null", () => {
      const entity = Company.create({
        id: "company-002",
        name: "Corp",
        code: "CORP",
        description: null,
        isActive: false,
        productCount: 0,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      });

      const dto = CompanyMapper.toDto(entity);

      expect(dto.description).toBeNull();
      expect(dto.isActive).toBe(false);
      expect(dto.productCount).toBe(0);
    });
  });
});
