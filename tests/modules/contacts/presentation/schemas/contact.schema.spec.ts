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
        email: "john@example.com",
        phone: "+57 300 123 4567",
        address: "123 Main St",
        notes: "Important",
      };

      const result = createContactSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("SUPPLIER");
        expect(result.data.email).toBe("john@example.com");
        expect(result.data.phone).toBe("+57 300 123 4567");
        expect(result.data.address).toBe("123 Main St");
      }
    });

    it("Given: valid email When: parsing Then: should pass validation", () => {
      const data = {
        name: "John Doe",
        identification: "12345678-9",
        type: "CUSTOMER",
        email: "john.doe@company.co",
      };

      const result = createContactSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("john.doe@company.co");
      }
    });

    it("Given: invalid email When: parsing Then: should fail validation", () => {
      const data = {
        name: "John Doe",
        identification: "12345678-9",
        type: "CUSTOMER",
        email: "not-an-email",
      };

      const result = createContactSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: empty email string When: parsing Then: should pass validation", () => {
      const data = {
        name: "John Doe",
        identification: "12345678-9",
        type: "CUSTOMER",
        email: "",
      };

      const result = createContactSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("Given: phone provided When: parsing Then: should pass validation", () => {
      const data = {
        name: "John Doe",
        identification: "12345678-9",
        type: "CUSTOMER",
        phone: "+57 300 123 4567",
      };

      const result = createContactSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.phone).toBe("+57 300 123 4567");
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
        email: "",
        phone: "",
        address: "",
        notes: "",
      };

      const dto = toCreateContactDto(formData);

      expect(dto.name).toBe("John Doe");
      expect(dto.identification).toBe("12345678-9");
      expect(dto.type).toBe("CUSTOMER");
      expect(dto.email).toBeUndefined();
      expect(dto.phone).toBeUndefined();
      expect(dto.address).toBeUndefined();
      expect(dto.notes).toBeUndefined();
    });

    it("Given: form data with all fields When: converting Then: should include all", () => {
      const formData = {
        name: "John Doe",
        identification: "12345678-9",
        type: "SUPPLIER" as const,
        email: "john@example.com",
        phone: "+57 300 123 4567",
        address: "123 Main St",
        notes: "VIP",
      };

      const dto = toCreateContactDto(formData);

      expect(dto.email).toBe("john@example.com");
      expect(dto.phone).toBe("+57 300 123 4567");
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
        email: "jane@example.com",
        phone: "+57 311 987 6543",
        address: "456 Oak Ave",
        notes: "Updated",
        isActive: true,
      };

      const dto = toUpdateContactDto(formData);

      expect(dto.name).toBe("Jane Doe");
      expect(dto.type).toBe("SUPPLIER");
      expect(dto.email).toBe("jane@example.com");
      expect(dto.phone).toBe("+57 311 987 6543");
      expect(dto.address).toBe("456 Oak Ave");
      expect(dto.isActive).toBe(true);
    });

    it("Given: update form data with empty email/phone When: converting Then: should strip them", () => {
      const formData = {
        name: "Jane Doe",
        identification: "87654321",
        type: "SUPPLIER" as const,
        email: "",
        phone: "",
        address: "",
        notes: "",
        isActive: false,
      };

      const dto = toUpdateContactDto(formData);

      expect(dto.email).toBeUndefined();
      expect(dto.phone).toBeUndefined();
      expect(dto.address).toBeUndefined();
      expect(dto.notes).toBeUndefined();
      expect(dto.isActive).toBe(false);
    });
  });
});
