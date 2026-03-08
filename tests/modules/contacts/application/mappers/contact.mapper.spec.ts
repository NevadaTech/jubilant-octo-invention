import { describe, it, expect } from "vitest";
import { ContactMapper } from "@/modules/contacts/application/mappers/contact.mapper";
import type { ContactResponseDto } from "@/modules/contacts/application/dto/contact.dto";

describe("ContactMapper", () => {
  const mockDto: ContactResponseDto = {
    id: "contact-001",
    name: "John Doe",
    identification: "12345678-9",
    type: "CUSTOMER",
    address: "123 Main St",
    notes: "Key contact",
    isActive: true,
    salesCount: 3,
    createdAt: "2026-03-07T10:00:00.000Z",
    updatedAt: "2026-03-07T12:00:00.000Z",
  };

  describe("toDomain", () => {
    it("Given: valid DTO When: mapping Then: should return Contact entity with correct values", () => {
      const contact = ContactMapper.toDomain(mockDto);

      expect(contact.id).toBe("contact-001");
      expect(contact.name).toBe("John Doe");
      expect(contact.identification).toBe("12345678-9");
      expect(contact.type).toBe("CUSTOMER");
      expect(contact.address).toBe("123 Main St");
      expect(contact.notes).toBe("Key contact");
      expect(contact.isActive).toBe(true);
      expect(contact.salesCount).toBe(3);
    });

    it("Given: date strings When: mapping Then: should convert to Date objects", () => {
      const contact = ContactMapper.toDomain(mockDto);

      expect(contact.createdAt).toBeInstanceOf(Date);
      expect(contact.updatedAt).toBeInstanceOf(Date);
      expect(contact.createdAt.toISOString()).toBe("2026-03-07T10:00:00.000Z");
    });

    it("Given: null address and notes When: mapping Then: should preserve null", () => {
      const dto: ContactResponseDto = {
        ...mockDto,
        address: null,
        notes: null,
      };

      const contact = ContactMapper.toDomain(dto);

      expect(contact.address).toBeNull();
      expect(contact.notes).toBeNull();
    });

    it("Given: undefined salesCount When: mapping Then: should default to 0", () => {
      const dto = { ...mockDto } as ContactResponseDto;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (dto as any).salesCount;

      const contact = ContactMapper.toDomain(dto);

      expect(contact.salesCount).toBe(0);
    });

    it("Given: SUPPLIER type When: mapping Then: should map type correctly", () => {
      const dto: ContactResponseDto = { ...mockDto, type: "SUPPLIER" };

      const contact = ContactMapper.toDomain(dto);

      expect(contact.type).toBe("SUPPLIER");
      expect(contact.isSupplier).toBe(true);
    });

    it("Given: CUSTOMER type When: mapping Then: should map type correctly", () => {
      const dto: ContactResponseDto = { ...mockDto, type: "CUSTOMER" };

      const contact = ContactMapper.toDomain(dto);

      expect(contact.type).toBe("CUSTOMER");
      expect(contact.isCustomer).toBe(true);
      expect(contact.isSupplier).toBe(false);
    });
  });
});
