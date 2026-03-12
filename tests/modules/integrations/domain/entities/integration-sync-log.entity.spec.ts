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
    action: "SYNCED",
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
      expect(entity.action).toBe("SYNCED");
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
    it("Given: SYNCED action When: checking action Then: should return SYNCED", () => {
      const entity = IntegrationSyncLog.create(validProps);

      expect(entity.action).toBe("SYNCED");
    });

    it("Given: ALREADY_SYNCED action When: checking action Then: should return ALREADY_SYNCED", () => {
      const entity = IntegrationSyncLog.create({
        ...validProps,
        action: "ALREADY_SYNCED",
      });

      expect(entity.action).toBe("ALREADY_SYNCED");
    });

    it("Given: FAILED action When: checking action Then: should return FAILED", () => {
      const entity = IntegrationSyncLog.create({
        ...validProps,
        action: "FAILED",
        errorMessage: "Connection timeout",
      });

      expect(entity.action).toBe("FAILED");
      expect(entity.errorMessage).toBe("Connection timeout");
    });
  });

  describe("isFailed", () => {
    it("Given: FAILED action When: checking isFailed Then: should return true", () => {
      const entity = IntegrationSyncLog.create({
        ...validProps,
        action: "FAILED",
      });

      expect(entity.isFailed).toBe(true);
    });

    it("Given: SYNCED action When: checking isFailed Then: should return false", () => {
      const entity = IntegrationSyncLog.create({
        ...validProps,
        action: "SYNCED",
      });

      expect(entity.isFailed).toBe(false);
    });

    it("Given: ALREADY_SYNCED action When: checking isFailed Then: should return false", () => {
      const entity = IntegrationSyncLog.create({
        ...validProps,
        action: "ALREADY_SYNCED",
      });

      expect(entity.isFailed).toBe(false);
    });
  });

  describe("isSynced", () => {
    it("Given: SYNCED action When: checking isSynced Then: should return true", () => {
      const entity = IntegrationSyncLog.create({
        ...validProps,
        action: "SYNCED",
      });

      expect(entity.isSynced).toBe(true);
    });

    it("Given: FAILED action When: checking isSynced Then: should return false", () => {
      const entity = IntegrationSyncLog.create({
        ...validProps,
        action: "FAILED",
      });

      expect(entity.isSynced).toBe(false);
    });

    it("Given: ALREADY_SYNCED action When: checking isSynced Then: should return false", () => {
      const entity = IntegrationSyncLog.create({
        ...validProps,
        action: "ALREADY_SYNCED",
      });

      expect(entity.isSynced).toBe(false);
    });
  });
});
