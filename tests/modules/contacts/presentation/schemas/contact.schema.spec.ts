import { describe, it, expect } from "vitest";
import {
  createContactSchema,
  updateContactSchema,
  toCreateContactDto,
  toUpdateContactDto,
} from "@/modules/contacts/presentation/schemas/contact.schema";

describe("Contact Schemas", () => {
  describe("createContactSchema", () => {
    it("Given: valid data When: parsing Then: should pass validation", () => {
      const data = {
        name: "John Doe",
        identification: "12345678-9",
        type: "CUSTOMER",
      };

      const result = createContactSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("Given: all fields When: parsing Then: should pass validation", () => {
      const data = {
        name: "John Doe",
        identification: "12345678-9",
        type: "SUPPLIER",
        address: "123 Main St",
        notes: "Important",
      };

      const result = createContactSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("SUPPLIER");
        expect(result.data.address).toBe("123 Main St");
      }
    });

    it("Given: missing name When: parsing Then: should fail validation", () => {
      const data = {
        name: "",
        identification: "12345678-9",
        type: "CUSTOMER",
      };

      const result = createContactSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: missing identification When: parsing Then: should fail validation", () => {
      const data = {
        name: "John Doe",
        identification: "",
        type: "CUSTOMER",
      };

      const result = createContactSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: invalid type When: parsing Then: should fail validation", () => {
      const data = {
        name: "John Doe",
        identification: "12345678-9",
        type: "INVALID",
      };

      const result = createContactSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: SUPPLIER type When: parsing Then: should pass validation", () => {
      const data = {
        name: "Supplier Corp",
        identification: "99999999",
        type: "SUPPLIER",
      };

      const result = createContactSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("Given: no type When: parsing Then: should default to CUSTOMER", () => {
      const data = {
        name: "John Doe",
        identification: "12345678-9",
      };

      const result = createContactSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("CUSTOMER");
      }
    });
  });

  describe("updateContactSchema", () => {
    it("Given: valid data with isActive When: parsing Then: should pass", () => {
      const data = {
        name: "Jane Doe",
        identification: "87654321",
        type: "SUPPLIER",
        isActive: false,
      };

      const result = updateContactSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(false);
      }
    });
  });

  describe("toCreateContactDto", () => {
    it("Given: form data When: converting Then: should strip empty optional fields", () => {
      const formData = {
        name: "John Doe",
        identification: "12345678-9",
        type: "CUSTOMER" as const,
        address: "",
        notes: "",
      };

      const dto = toCreateContactDto(formData);

      expect(dto.name).toBe("John Doe");
      expect(dto.identification).toBe("12345678-9");
      expect(dto.type).toBe("CUSTOMER");
      expect(dto.address).toBeUndefined();
      expect(dto.notes).toBeUndefined();
    });

    it("Given: form data with address When: converting Then: should include address", () => {
      const formData = {
        name: "John Doe",
        identification: "12345678-9",
        type: "SUPPLIER" as const,
        address: "123 Main St",
        notes: "VIP",
      };

      const dto = toCreateContactDto(formData);

      expect(dto.address).toBe("123 Main St");
      expect(dto.notes).toBe("VIP");
    });
  });

  describe("toUpdateContactDto", () => {
    it("Given: update form data When: converting Then: should include all fields", () => {
      const formData = {
        name: "Jane Doe",
        identification: "87654321",
        type: "SUPPLIER" as const,
        address: "456 Oak Ave",
        notes: "Updated",
        isActive: true,
      };

      const dto = toUpdateContactDto(formData);

      expect(dto.name).toBe("Jane Doe");
      expect(dto.type).toBe("SUPPLIER");
      expect(dto.address).toBe("456 Oak Ave");
      expect(dto.isActive).toBe(true);
    });
  });
});
