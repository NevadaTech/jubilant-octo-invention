import { describe, it, expect } from "vitest";
import {
  IntegrationConnection,
  type IntegrationConnectionProps,
} from "@/modules/integrations/domain/entities/integration-connection.entity";

describe("IntegrationConnection Entity", () => {
  const now = new Date("2026-03-07T10:00:00.000Z");
  const connectedAt = new Date("2026-03-06T08:00:00.000Z");
  const lastSyncAt = new Date("2026-03-07T09:00:00.000Z");

  const validProps: IntegrationConnectionProps = {
    id: "conn-001",
    provider: "VTEX",
    accountName: "my-store",
    storeName: "My Store",
    status: "CONNECTED",
    syncStrategy: "WEBHOOK",
    syncDirection: "INBOUND",
    defaultWarehouseId: "wh-001",
    warehouseName: "Main Warehouse",
    defaultContactId: "contact-001",
    defaultContactName: "Default Customer",
    companyId: "company-001",
    companyName: "My Company",
    connectedAt,
    lastSyncAt,
    lastSyncError: null,
    syncedOrdersCount: 42,
    createdAt: now,
    updatedAt: now,
  };

  describe("create", () => {
    it("Given: valid props When: creating Then: should create with correct data", () => {
      const entity = IntegrationConnection.create(validProps);

      expect(entity.id).toBe("conn-001");
      expect(entity.provider).toBe("VTEX");
      expect(entity.accountName).toBe("my-store");
      expect(entity.storeName).toBe("My Store");
      expect(entity.status).toBe("CONNECTED");
      expect(entity.syncStrategy).toBe("WEBHOOK");
      expect(entity.syncDirection).toBe("INBOUND");
      expect(entity.defaultWarehouseId).toBe("wh-001");
      expect(entity.warehouseName).toBe("Main Warehouse");
      expect(entity.defaultContactId).toBe("contact-001");
      expect(entity.defaultContactName).toBe("Default Customer");
      expect(entity.companyId).toBe("company-001");
      expect(entity.companyName).toBe("My Company");
      expect(entity.connectedAt).toEqual(connectedAt);
      expect(entity.lastSyncAt).toEqual(lastSyncAt);
      expect(entity.lastSyncError).toBeNull();
      expect(entity.syncedOrdersCount).toBe(42);
      expect(entity.createdAt).toEqual(now);
      expect(entity.updatedAt).toEqual(now);
    });

    it("Given: null optional fields When: creating Then: should preserve null values", () => {
      const props: IntegrationConnectionProps = {
        ...validProps,
        warehouseName: null,
        defaultContactId: null,
        defaultContactName: null,
        companyId: null,
        companyName: null,
        connectedAt: null,
        lastSyncAt: null,
        lastSyncError: null,
      };

      const entity = IntegrationConnection.create(props);

      expect(entity.warehouseName).toBeNull();
      expect(entity.defaultContactId).toBeNull();
      expect(entity.defaultContactName).toBeNull();
      expect(entity.companyId).toBeNull();
      expect(entity.companyName).toBeNull();
      expect(entity.connectedAt).toBeNull();
      expect(entity.lastSyncAt).toBeNull();
      expect(entity.lastSyncError).toBeNull();
    });

    it("Given: error status with lastSyncError When: creating Then: should store error message", () => {
      const props: IntegrationConnectionProps = {
        ...validProps,
        status: "ERROR",
        lastSyncError: "Authentication failed: invalid app key",
      };

      const entity = IntegrationConnection.create(props);

      expect(entity.status).toBe("ERROR");
      expect(entity.lastSyncError).toBe(
        "Authentication failed: invalid app key",
      );
    });
  });

  describe("getters", () => {
    it("Given: VTEX provider When: checking provider Then: should return VTEX", () => {
      const entity = IntegrationConnection.create(validProps);

      expect(entity.provider).toBe("VTEX");
    });

    it("Given: MERCADOLIBRE provider When: checking provider Then: should return MERCADOLIBRE", () => {
      const entity = IntegrationConnection.create({
        ...validProps,
        provider: "MERCADOLIBRE",
      });

      expect(entity.provider).toBe("MERCADOLIBRE");
    });

    it("Given: POLLING strategy When: checking syncStrategy Then: should return POLLING", () => {
      const entity = IntegrationConnection.create({
        ...validProps,
        syncStrategy: "POLLING",
      });

      expect(entity.syncStrategy).toBe("POLLING");
    });

    it("Given: BOTH strategy When: checking syncStrategy Then: should return BOTH", () => {
      const entity = IntegrationConnection.create({
        ...validProps,
        syncStrategy: "BOTH",
      });

      expect(entity.syncStrategy).toBe("BOTH");
    });

    it("Given: OUTBOUND direction When: checking syncDirection Then: should return OUTBOUND", () => {
      const entity = IntegrationConnection.create({
        ...validProps,
        syncDirection: "OUTBOUND",
      });

      expect(entity.syncDirection).toBe("OUTBOUND");
    });

    it("Given: BIDIRECTIONAL direction When: checking syncDirection Then: should return BIDIRECTIONAL", () => {
      const entity = IntegrationConnection.create({
        ...validProps,
        syncDirection: "BIDIRECTIONAL",
      });

      expect(entity.syncDirection).toBe("BIDIRECTIONAL");
    });

    it("Given: zero synced orders When: checking count Then: should return 0", () => {
      const entity = IntegrationConnection.create({
        ...validProps,
        syncedOrdersCount: 0,
      });

      expect(entity.syncedOrdersCount).toBe(0);
    });
  });

  describe("isConnected", () => {
    it("Given: CONNECTED status When: checking isConnected Then: should return true", () => {
      const entity = IntegrationConnection.create({
        ...validProps,
        status: "CONNECTED",
      });

      expect(entity.isConnected).toBe(true);
      expect(entity.hasError).toBe(false);
    });

    it("Given: DISCONNECTED status When: checking isConnected Then: should return false", () => {
      const entity = IntegrationConnection.create({
        ...validProps,
        status: "DISCONNECTED",
      });

      expect(entity.isConnected).toBe(false);
      expect(entity.hasError).toBe(false);
    });
  });

  describe("hasError", () => {
    it("Given: ERROR status When: checking hasError Then: should return true", () => {
      const entity = IntegrationConnection.create({
        ...validProps,
        status: "ERROR",
      });

      expect(entity.hasError).toBe(true);
      expect(entity.isConnected).toBe(false);
    });

    it("Given: CONNECTED status When: checking hasError Then: should return false", () => {
      const entity = IntegrationConnection.create({
        ...validProps,
        status: "CONNECTED",
      });

      expect(entity.hasError).toBe(false);
    });
  });
});
