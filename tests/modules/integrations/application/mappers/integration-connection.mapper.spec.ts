import { describe, it, expect } from "vitest";
import { IntegrationConnectionMapper } from "@/modules/integrations/application/mappers/integration-connection.mapper";
import type { IntegrationConnectionResponseDto } from "@/modules/integrations/application/dto/integration-connection.dto";

describe("IntegrationConnectionMapper", () => {
  const mockDto: IntegrationConnectionResponseDto = {
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
    connectedAt: "2026-03-06T08:00:00.000Z",
    lastSyncAt: "2026-03-07T09:00:00.000Z",
    lastSyncError: null,
    syncedOrdersCount: 42,
    createdAt: "2026-03-05T10:00:00.000Z",
    updatedAt: "2026-03-07T12:00:00.000Z",
  };

  describe("toDomain", () => {
    it("Given: valid DTO When: mapping Then: should return IntegrationConnection entity with correct values", () => {
      const connection = IntegrationConnectionMapper.toDomain(mockDto);

      expect(connection.id).toBe("conn-001");
      expect(connection.provider).toBe("VTEX");
      expect(connection.accountName).toBe("my-store");
      expect(connection.storeName).toBe("My Store");
      expect(connection.status).toBe("CONNECTED");
      expect(connection.syncStrategy).toBe("WEBHOOK");
      expect(connection.syncDirection).toBe("INBOUND");
      expect(connection.defaultWarehouseId).toBe("wh-001");
      expect(connection.warehouseName).toBe("Main Warehouse");
      expect(connection.defaultContactId).toBe("contact-001");
      expect(connection.defaultContactName).toBe("Default Customer");
      expect(connection.companyId).toBe("company-001");
      expect(connection.companyName).toBe("My Company");
      expect(connection.syncedOrdersCount).toBe(42);
      expect(connection.lastSyncError).toBeNull();
    });

    it("Given: date strings When: mapping Then: should convert to Date objects", () => {
      const connection = IntegrationConnectionMapper.toDomain(mockDto);

      expect(connection.createdAt).toBeInstanceOf(Date);
      expect(connection.updatedAt).toBeInstanceOf(Date);
      expect(connection.connectedAt).toBeInstanceOf(Date);
      expect(connection.lastSyncAt).toBeInstanceOf(Date);
      expect(connection.createdAt.toISOString()).toBe(
        "2026-03-05T10:00:00.000Z",
      );
      expect(connection.connectedAt!.toISOString()).toBe(
        "2026-03-06T08:00:00.000Z",
      );
      expect(connection.lastSyncAt!.toISOString()).toBe(
        "2026-03-07T09:00:00.000Z",
      );
    });

    it("Given: null connectedAt and lastSyncAt When: mapping Then: should preserve null dates", () => {
      const dto: IntegrationConnectionResponseDto = {
        ...mockDto,
        connectedAt: null,
        lastSyncAt: null,
      };

      const connection = IntegrationConnectionMapper.toDomain(dto);

      expect(connection.connectedAt).toBeNull();
      expect(connection.lastSyncAt).toBeNull();
    });

    it("Given: undefined optional fields When: mapping Then: should default to null", () => {
      const dto = { ...mockDto } as IntegrationConnectionResponseDto;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (dto as any).warehouseName;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (dto as any).defaultContactId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (dto as any).defaultContactName;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (dto as any).companyId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (dto as any).companyName;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (dto as any).lastSyncError;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (dto as any).connectedAt;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (dto as any).lastSyncAt;

      const connection = IntegrationConnectionMapper.toDomain(dto);

      expect(connection.warehouseName).toBeNull();
      expect(connection.defaultContactId).toBeNull();
      expect(connection.defaultContactName).toBeNull();
      expect(connection.companyId).toBeNull();
      expect(connection.companyName).toBeNull();
      expect(connection.lastSyncError).toBeNull();
      expect(connection.connectedAt).toBeNull();
      expect(connection.lastSyncAt).toBeNull();
    });

    it("Given: undefined syncedOrdersCount When: mapping Then: should default to 0", () => {
      const dto = { ...mockDto } as IntegrationConnectionResponseDto;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (dto as any).syncedOrdersCount;

      const connection = IntegrationConnectionMapper.toDomain(dto);

      expect(connection.syncedOrdersCount).toBe(0);
    });

    it("Given: ERROR status with lastSyncError When: mapping Then: should map error correctly", () => {
      const dto: IntegrationConnectionResponseDto = {
        ...mockDto,
        status: "ERROR",
        lastSyncError: "Connection timeout",
      };

      const connection = IntegrationConnectionMapper.toDomain(dto);

      expect(connection.status).toBe("ERROR");
      expect(connection.hasError).toBe(true);
      expect(connection.isConnected).toBe(false);
      expect(connection.lastSyncError).toBe("Connection timeout");
    });

    it("Given: DISCONNECTED status When: mapping Then: should map status correctly", () => {
      const dto: IntegrationConnectionResponseDto = {
        ...mockDto,
        status: "DISCONNECTED",
      };

      const connection = IntegrationConnectionMapper.toDomain(dto);

      expect(connection.status).toBe("DISCONNECTED");
      expect(connection.isConnected).toBe(false);
      expect(connection.hasError).toBe(false);
    });

    it("Given: MERCADOLIBRE provider When: mapping Then: should map provider correctly", () => {
      const dto: IntegrationConnectionResponseDto = {
        ...mockDto,
        provider: "MERCADOLIBRE",
      };

      const connection = IntegrationConnectionMapper.toDomain(dto);

      expect(connection.provider).toBe("MERCADOLIBRE");
    });
  });
});
