import { describe, it, expect } from "vitest";
import { IntegrationSyncLogMapper } from "@/modules/integrations/application/mappers/integration-sync-log.mapper";
import type { IntegrationSyncLogResponseDto } from "@/modules/integrations/application/dto/integration-sync-log.dto";

describe("IntegrationSyncLogMapper", () => {
  const mockDto: IntegrationSyncLogResponseDto = {
    id: "log-001",
    connectionId: "conn-001",
    externalOrderId: "VTEX-ORD-12345",
    action: "CREATED",
    saleId: "sale-001",
    contactId: "contact-001",
    errorMessage: null,
    processedAt: "2026-03-07T10:00:00.000Z",
  };

  describe("toDomain", () => {
    it("Given: valid DTO When: mapping Then: should return IntegrationSyncLog entity with correct values", () => {
      const log = IntegrationSyncLogMapper.toDomain(mockDto);

      expect(log.id).toBe("log-001");
      expect(log.connectionId).toBe("conn-001");
      expect(log.externalOrderId).toBe("VTEX-ORD-12345");
      expect(log.action).toBe("CREATED");
      expect(log.saleId).toBe("sale-001");
      expect(log.contactId).toBe("contact-001");
      expect(log.errorMessage).toBeNull();
    });

    it("Given: processedAt string When: mapping Then: should convert to Date object", () => {
      const log = IntegrationSyncLogMapper.toDomain(mockDto);

      expect(log.processedAt).toBeInstanceOf(Date);
      expect(log.processedAt.toISOString()).toBe("2026-03-07T10:00:00.000Z");
    });

    it("Given: null saleId and contactId When: mapping Then: should preserve null", () => {
      const dto: IntegrationSyncLogResponseDto = {
        ...mockDto,
        saleId: null,
        contactId: null,
      };

      const log = IntegrationSyncLogMapper.toDomain(dto);

      expect(log.saleId).toBeNull();
      expect(log.contactId).toBeNull();
    });

    it("Given: undefined optional fields When: mapping Then: should default to null", () => {
      const dto = { ...mockDto } as IntegrationSyncLogResponseDto;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (dto as any).saleId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (dto as any).contactId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (dto as any).errorMessage;

      const log = IntegrationSyncLogMapper.toDomain(dto);

      expect(log.saleId).toBeNull();
      expect(log.contactId).toBeNull();
      expect(log.errorMessage).toBeNull();
    });

    it("Given: FAILED action with error message When: mapping Then: should map error correctly", () => {
      const dto: IntegrationSyncLogResponseDto = {
        ...mockDto,
        action: "FAILED",
        saleId: null,
        errorMessage: "SKU not found: VTEX-SKU-999",
      };

      const log = IntegrationSyncLogMapper.toDomain(dto);

      expect(log.action).toBe("FAILED");
      expect(log.isFailed).toBe(true);
      expect(log.errorMessage).toBe("SKU not found: VTEX-SKU-999");
    });

    it("Given: OUTBOUND_FAILED action When: mapping Then: should map correctly", () => {
      const dto: IntegrationSyncLogResponseDto = {
        ...mockDto,
        action: "OUTBOUND_FAILED",
        errorMessage: "Failed to push inventory to VTEX",
      };

      const log = IntegrationSyncLogMapper.toDomain(dto);

      expect(log.action).toBe("OUTBOUND_FAILED");
      expect(log.isOutboundFailed).toBe(true);
      expect(log.isFailed).toBe(false);
    });

    it("Given: SKIPPED action When: mapping Then: should map correctly", () => {
      const dto: IntegrationSyncLogResponseDto = {
        ...mockDto,
        action: "SKIPPED",
      };

      const log = IntegrationSyncLogMapper.toDomain(dto);

      expect(log.action).toBe("SKIPPED");
      expect(log.isFailed).toBe(false);
      expect(log.isOutboundFailed).toBe(false);
    });

    it("Given: rawPayload is not in DTO When: mapping Then: should set rawPayload to null", () => {
      const log = IntegrationSyncLogMapper.toDomain(mockDto);

      expect(log.rawPayload).toBeNull();
    });
  });
});
