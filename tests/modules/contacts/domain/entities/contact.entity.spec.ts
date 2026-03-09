import { describe, it, expect } from "vitest";
import {
  Contact,
  type ContactProps,
} from "@/modules/contacts/domain/entities/contact.entity";

describe("Contact Entity", () => {
  const now = new Date("2026-03-07T10:00:00.000Z");

  const validProps: ContactProps = {
    id: "contact-001",
    name: "John Doe",
    identification: "12345678-9",
    type: "CUSTOMER",
    email: "john@example.com",
    phone: "+57 300 123 4567",
    address: "123 Main St, Bogotá",
    notes: "Important client",
    isActive: true,
    salesCount: 5,
    createdAt: now,
    updatedAt: now,
  };

  describe("create", () => {
    it("Given: valid props When: creating Then: should create with correct data", () => {
      const entity = Contact.create(validProps);

      expect(entity.id).toBe("contact-001");
      expect(entity.name).toBe("John Doe");
      expect(entity.identification).toBe("12345678-9");
      expect(entity.type).toBe("CUSTOMER");
      expect(entity.email).toBe("john@example.com");
      expect(entity.phone).toBe("+57 300 123 4567");
      expect(entity.address).toBe("123 Main St, Bogotá");
      expect(entity.notes).toBe("Important client");
      expect(entity.isActive).toBe(true);
      expect(entity.salesCount).toBe(5);
      expect(entity.createdAt).toEqual(now);
      expect(entity.updatedAt).toEqual(now);
    });

    it("Given: minimal props with nulls When: creating Then: should preserve null values", () => {
      const props: ContactProps = {
        ...validProps,
        email: null,
        phone: null,
        address: null,
        notes: null,
        salesCount: 0,
      };

      const entity = Contact.create(props);

      expect(entity.email).toBeNull();
      expect(entity.phone).toBeNull();
      expect(entity.address).toBeNull();
      expect(entity.notes).toBeNull();
      expect(entity.salesCount).toBe(0);
    });

    it("Given: email and phone provided When: creating Then: should store email and phone", () => {
      const entity = Contact.create(validProps);

      expect(entity.email).toBe("john@example.com");
      expect(entity.phone).toBe("+57 300 123 4567");
    });

    it("Given: null email and phone When: creating Then: should accept null values", () => {
      const props: ContactProps = {
        ...validProps,
        email: null,
        phone: null,
      };

      const entity = Contact.create(props);

      expect(entity.email).toBeNull();
      expect(entity.phone).toBeNull();
    });
  });

  describe("type getters", () => {
    it("Given: CUSTOMER type When: checking isCustomer Then: should return true", () => {
      const entity = Contact.create({ ...validProps, type: "CUSTOMER" });

      expect(entity.isCustomer).toBe(true);
      expect(entity.isSupplier).toBe(false);
    });

    it("Given: SUPPLIER type When: checking isSupplier Then: should return true", () => {
      const entity = Contact.create({ ...validProps, type: "SUPPLIER" });

      expect(entity.isCustomer).toBe(false);
      expect(entity.isSupplier).toBe(true);
    });

    it("Given: SUPPLIER type When: checking isCustomer Then: should return false", () => {
      const entity = Contact.create({ ...validProps, type: "SUPPLIER" });

      expect(entity.isCustomer).toBe(false);
      expect(entity.isSupplier).toBe(true);
    });
  });

  describe("inactive contact", () => {
    it("Given: inactive contact When: checking isActive Then: should return false", () => {
      const entity = Contact.create({ ...validProps, isActive: false });

      expect(entity.isActive).toBe(false);
    });
  });
});
