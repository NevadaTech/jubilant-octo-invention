import { describe, it, expect } from "vitest";
import {
  vtexConnectionSchema,
  toCreateConnectionDto,
  toUpdateConnectionDto,
  updateConnectionSchema,
  skuMappingSchema,
} from "@/modules/integrations/presentation/schemas/integration-connection.schema";

describe("Integration Connection Schemas", () => {
  describe("vtexConnectionSchema", () => {
    const validData = {
      accountName: "my-store",
      storeName: "My Store",
      appKey: "vtexappkey-my-store-AAAA",
      appToken: "some-secret-app-token",
      syncStrategy: "WEBHOOK",
      syncDirection: "INBOUND",
      defaultWarehouseId: "wh-001",
    };

    it("Given: valid data When: parsing Then: should pass validation", () => {
      const result = vtexConnectionSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("Given: all optional fields When: parsing Then: should pass validation", () => {
      const data = {
        ...validData,
        defaultContactId: "contact-001",
        companyId: "company-001",
      };

      const result = vtexConnectionSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.defaultContactId).toBe("contact-001");
        expect(result.data.companyId).toBe("company-001");
      }
    });

    it("Given: missing accountName When: parsing Then: should fail validation", () => {
      const data = { ...validData, accountName: "" };

      const result = vtexConnectionSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: missing storeName When: parsing Then: should fail validation", () => {
      const data = { ...validData, storeName: "" };

      const result = vtexConnectionSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: missing appKey When: parsing Then: should fail validation", () => {
      const data = { ...validData, appKey: "" };

      const result = vtexConnectionSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: missing appToken When: parsing Then: should fail validation", () => {
      const data = { ...validData, appToken: "" };

      const result = vtexConnectionSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: missing defaultWarehouseId When: parsing Then: should fail validation", () => {
      const data = { ...validData, defaultWarehouseId: "" };

      const result = vtexConnectionSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: invalid accountName format (with spaces) When: parsing Then: should fail validation", () => {
      const data = { ...validData, accountName: "my store name" };

      const result = vtexConnectionSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: invalid accountName format (with special chars) When: parsing Then: should fail validation", () => {
      const data = { ...validData, accountName: "my_store@name" };

      const result = vtexConnectionSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: valid accountName with hyphens When: parsing Then: should pass validation", () => {
      const data = { ...validData, accountName: "my-store-name" };

      const result = vtexConnectionSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("Given: valid accountName with alphanumeric only When: parsing Then: should pass validation", () => {
      const data = { ...validData, accountName: "mystore123" };

      const result = vtexConnectionSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("Given: invalid syncStrategy When: parsing Then: should fail validation", () => {
      const data = { ...validData, syncStrategy: "INVALID" };

      const result = vtexConnectionSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: invalid syncDirection When: parsing Then: should fail validation", () => {
      const data = { ...validData, syncDirection: "INVALID" };

      const result = vtexConnectionSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: POLLING syncStrategy When: parsing Then: should pass validation", () => {
      const data = { ...validData, syncStrategy: "POLLING" };

      const result = vtexConnectionSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.syncStrategy).toBe("POLLING");
      }
    });

    it("Given: BOTH syncStrategy When: parsing Then: should pass validation", () => {
      const data = { ...validData, syncStrategy: "BOTH" };

      const result = vtexConnectionSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.syncStrategy).toBe("BOTH");
      }
    });

    it("Given: OUTBOUND syncDirection When: parsing Then: should pass validation", () => {
      const data = { ...validData, syncDirection: "OUTBOUND" };

      const result = vtexConnectionSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.syncDirection).toBe("OUTBOUND");
      }
    });

    it("Given: BIDIRECTIONAL syncDirection When: parsing Then: should pass validation", () => {
      const data = { ...validData, syncDirection: "BIDIRECTIONAL" };

      const result = vtexConnectionSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.syncDirection).toBe("BIDIRECTIONAL");
      }
    });

    it("Given: accountName exceeding max length When: parsing Then: should fail validation", () => {
      const data = { ...validData, accountName: "a".repeat(101) };

      const result = vtexConnectionSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: storeName exceeding max length When: parsing Then: should fail validation", () => {
      const data = { ...validData, storeName: "a".repeat(201) };

      const result = vtexConnectionSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe("updateConnectionSchema", () => {
    const validUpdateData = {
      storeName: "Updated Store",
      syncStrategy: "POLLING",
      syncDirection: "BIDIRECTIONAL",
      defaultWarehouseId: "wh-002",
    };

    it("Given: valid data When: parsing Then: should pass validation", () => {
      const result = updateConnectionSchema.safeParse(validUpdateData);

      expect(result.success).toBe(true);
    });

    it("Given: optional appKey and appToken When: parsing Then: should pass validation", () => {
      const data = {
        ...validUpdateData,
        appKey: "new-key",
        appToken: "new-token",
      };

      const result = updateConnectionSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.appKey).toBe("new-key");
        expect(result.data.appToken).toBe("new-token");
      }
    });

    it("Given: missing storeName When: parsing Then: should fail validation", () => {
      const data = { ...validUpdateData, storeName: "" };

      const result = updateConnectionSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe("toCreateConnectionDto", () => {
    it("Given: form data When: converting Then: should return correct DTO with provider VTEX", () => {
      const formData = {
        accountName: "my-store",
        storeName: "My Store",
        appKey: "vtexappkey-my-store",
        appToken: "secret-token",
        syncStrategy: "WEBHOOK" as const,
        syncDirection: "INBOUND" as const,
        defaultWarehouseId: "wh-001",
      };

      const dto = toCreateConnectionDto(formData);

      expect(dto.provider).toBe("VTEX");
      expect(dto.accountName).toBe("my-store");
      expect(dto.storeName).toBe("My Store");
      expect(dto.appKey).toBe("vtexappkey-my-store");
      expect(dto.appToken).toBe("secret-token");
      expect(dto.syncStrategy).toBe("WEBHOOK");
      expect(dto.syncDirection).toBe("INBOUND");
      expect(dto.defaultWarehouseId).toBe("wh-001");
    });

    it("Given: form data with optional contactId When: converting Then: should include contactId", () => {
      const formData = {
        accountName: "my-store",
        storeName: "My Store",
        appKey: "key",
        appToken: "token",
        syncStrategy: "WEBHOOK" as const,
        syncDirection: "INBOUND" as const,
        defaultWarehouseId: "wh-001",
        defaultContactId: "contact-001",
      };

      const dto = toCreateConnectionDto(formData);

      expect(dto.defaultContactId).toBe("contact-001");
    });

    it("Given: form data with empty optional fields When: converting Then: should strip empty values", () => {
      const formData = {
        accountName: "my-store",
        storeName: "My Store",
        appKey: "key",
        appToken: "token",
        syncStrategy: "WEBHOOK" as const,
        syncDirection: "INBOUND" as const,
        defaultWarehouseId: "wh-001",
        defaultContactId: "",
        companyId: "",
      };

      const dto = toCreateConnectionDto(formData);

      expect(dto.defaultContactId).toBeUndefined();
      expect(dto.companyId).toBeUndefined();
    });
  });

  describe("toUpdateConnectionDto", () => {
    it("Given: update form data When: converting Then: should return correct DTO", () => {
      const formData = {
        storeName: "Updated Store",
        appKey: "new-key",
        appToken: "new-token",
        syncStrategy: "POLLING" as const,
        syncDirection: "BIDIRECTIONAL" as const,
        defaultWarehouseId: "wh-002",
      };

      const dto = toUpdateConnectionDto(formData);

      expect(dto.storeName).toBe("Updated Store");
      expect(dto.appKey).toBe("new-key");
      expect(dto.appToken).toBe("new-token");
      expect(dto.syncStrategy).toBe("POLLING");
      expect(dto.syncDirection).toBe("BIDIRECTIONAL");
      expect(dto.defaultWarehouseId).toBe("wh-002");
    });

    it("Given: update form data with empty appKey/appToken When: converting Then: should strip them", () => {
      const formData = {
        storeName: "Updated Store",
        appKey: "",
        appToken: "",
        syncStrategy: "WEBHOOK" as const,
        syncDirection: "INBOUND" as const,
        defaultWarehouseId: "wh-001",
        defaultContactId: "",
        companyId: "",
      };

      const dto = toUpdateConnectionDto(formData);

      expect(dto.appKey).toBeUndefined();
      expect(dto.appToken).toBeUndefined();
      expect(dto.defaultContactId).toBeUndefined();
      expect(dto.companyId).toBeUndefined();
    });
  });

  describe("skuMappingSchema", () => {
    it("Given: valid data When: parsing Then: should pass validation", () => {
      const data = {
        externalSku: "VTEX-SKU-001",
        productId: "prod-001",
      };

      const result = skuMappingSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.externalSku).toBe("VTEX-SKU-001");
        expect(result.data.productId).toBe("prod-001");
      }
    });

    it("Given: missing externalSku When: parsing Then: should fail validation", () => {
      const data = {
        externalSku: "",
        productId: "prod-001",
      };

      const result = skuMappingSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: missing productId When: parsing Then: should fail validation", () => {
      const data = {
        externalSku: "VTEX-SKU-001",
        productId: "",
      };

      const result = skuMappingSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: missing both fields When: parsing Then: should fail validation", () => {
      const data = {};

      const result = skuMappingSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });
});
