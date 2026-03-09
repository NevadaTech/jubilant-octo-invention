import { describe, it, expect } from "vitest";
import {
  IntegrationSyncLog,
  type IntegrationSyncLogProps,
} from "@/modules/integrations/domain/entities/integration-sync-log.entity";

describe("IntegrationSyncLog Entity", () => {
  const processedAt = new Date("2026-03-07T10:00:00.000Z");

  const validProps: IntegrationSyncLogProps = {
    id: "log-001",
    connectionId: "conn-001",
    externalOrderId: "VTEX-ORD-12345",
    action: "CREATED",
    saleId: "sale-001",
    contactId: "contact-001",
    errorMessage: null,
    rawPayload: { orderId: "VTEX-ORD-12345", total: 150000 },
    processedAt,
  };

  describe("create", () => {
    it("Given: valid props When: creating Then: should create with correct data", () => {
      const entity = IntegrationSyncLog.create(validProps);

      expect(entity.id).toBe("log-001");
      expect(entity.connectionId).toBe("conn-001");
      expect(entity.externalOrderId).toBe("VTEX-ORD-12345");
      expect(entity.action).toBe("CREATED");
      expect(entity.saleId).toBe("sale-001");
      expect(entity.contactId).toBe("contact-001");
      expect(entity.errorMessage).toBeNull();
      expect(entity.rawPayload).toEqual({
        orderId: "VTEX-ORD-12345",
        total: 150000,
      });
      expect(entity.processedAt).toEqual(processedAt);
    });

    it("Given: null optional fields When: creating Then: should preserve null values", () => {
      const props: IntegrationSyncLogProps = {
        ...validProps,
        saleId: null,
        contactId: null,
        rawPayload: null,
      };

      const entity = IntegrationSyncLog.create(props);

      expect(entity.saleId).toBeNull();
      expect(entity.contactId).toBeNull();
      expect(entity.rawPayload).toBeNull();
    });

    it("Given: FAILED action with error message When: creating Then: should store error", () => {
      const props: IntegrationSyncLogProps = {
        ...validProps,
        action: "FAILED",
        saleId: null,
        errorMessage: "Product SKU not found in catalog",
      };

      const entity = IntegrationSyncLog.create(props);

      expect(entity.action).toBe("FAILED");
      expect(entity.errorMessage).toBe("Product SKU not found in catalog");
      expect(entity.saleId).toBeNull();
    });
  });

  describe("getters", () => {
    it("Given: CREATED action When: checking action Then: should return CREATED", () => {
      const entity = IntegrationSyncLog.create(validProps);

      expect(entity.action).toBe("CREATED");
    });

    it("Given: UPDATED action When: checking action Then: should return UPDATED", () => {
      const entity = IntegrationSyncLog.create({
        ...validProps,
        action: "UPDATED",
      });

      expect(entity.action).toBe("UPDATED");
    });

    it("Given: SKIPPED action When: checking action Then: should return SKIPPED", () => {
      const entity = IntegrationSyncLog.create({
        ...validProps,
        action: "SKIPPED",
      });

      expect(entity.action).toBe("SKIPPED");
    });

    it("Given: OUTBOUND_OK action When: checking action Then: should return OUTBOUND_OK", () => {
      const entity = IntegrationSyncLog.create({
        ...validProps,
        action: "OUTBOUND_OK",
      });

      expect(entity.action).toBe("OUTBOUND_OK");
    });

    it("Given: OUTBOUND_FAILED action When: checking action Then: should return OUTBOUND_FAILED", () => {
      const entity = IntegrationSyncLog.create({
        ...validProps,
        action: "OUTBOUND_FAILED",
        errorMessage: "Failed to push stock to VTEX",
      });

      expect(entity.action).toBe("OUTBOUND_FAILED");
      expect(entity.errorMessage).toBe("Failed to push stock to VTEX");
    });
  });

  describe("isFailed", () => {
    it("Given: FAILED action When: checking isFailed Then: should return true", () => {
      const entity = IntegrationSyncLog.create({
        ...validProps,
        action: "FAILED",
      });

      expect(entity.isFailed).toBe(true);
      expect(entity.isOutboundFailed).toBe(false);
    });

    it("Given: CREATED action When: checking isFailed Then: should return false", () => {
      const entity = IntegrationSyncLog.create({
        ...validProps,
        action: "CREATED",
      });

      expect(entity.isFailed).toBe(false);
    });

    it("Given: OUTBOUND_FAILED action When: checking isFailed Then: should return false", () => {
      const entity = IntegrationSyncLog.create({
        ...validProps,
        action: "OUTBOUND_FAILED",
      });

      expect(entity.isFailed).toBe(false);
    });
  });

  describe("isOutboundFailed", () => {
    it("Given: OUTBOUND_FAILED action When: checking isOutboundFailed Then: should return true", () => {
      const entity = IntegrationSyncLog.create({
        ...validProps,
        action: "OUTBOUND_FAILED",
      });

      expect(entity.isOutboundFailed).toBe(true);
      expect(entity.isFailed).toBe(false);
    });

    it("Given: OUTBOUND_OK action When: checking isOutboundFailed Then: should return false", () => {
      const entity = IntegrationSyncLog.create({
        ...validProps,
        action: "OUTBOUND_OK",
      });

      expect(entity.isOutboundFailed).toBe(false);
    });

    it("Given: FAILED action When: checking isOutboundFailed Then: should return false", () => {
      const entity = IntegrationSyncLog.create({
        ...validProps,
        action: "FAILED",
      });

      expect(entity.isOutboundFailed).toBe(false);
    });
  });
});
