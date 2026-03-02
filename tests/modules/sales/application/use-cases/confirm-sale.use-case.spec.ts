import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConfirmSaleUseCase } from "@/modules/sales/application/use-cases/confirm-sale.use-case";
import type { SaleRepositoryPort } from "@/modules/sales/application/ports/sale.repository.port";
import {
  NotFoundError,
  ValidationError,
} from "@/shared/domain/errors/domain-error";
import { SaleConfirmedEvent } from "@/modules/sales/domain/events/sale.events";

vi.mock("@/shared/infrastructure/events", () => ({
  eventBus: {
    publish: vi.fn(),
    publishAll: vi.fn(),
    subscribe: vi.fn(),
    clear: vi.fn(),
  },
}));

import { eventBus } from "@/shared/infrastructure/events";

describe("ConfirmSaleUseCase", () => {
  let useCase: ConfirmSaleUseCase;
  let mockSaleRepository: {
    findById: ReturnType<typeof vi.fn>;
    confirm: ReturnType<typeof vi.fn>;
  };

  const mockSale = {
    id: "sale-1",
    saleNumber: "S-001",
    status: "DRAFT",
    totalAmount: 100,
    canConfirm: true,
    canCancel: true,
    canStartPicking: false,
    canShip: false,
    canComplete: false,
  };

  const confirmedSale = {
    ...mockSale,
    id: "sale-1",
    saleNumber: "S-001",
    status: "CONFIRMED",
    totalAmount: 100,
    canConfirm: false,
    canCancel: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSaleRepository = {
      findById: vi.fn(),
      confirm: vi.fn(),
    };
    useCase = new ConfirmSaleUseCase(
      mockSaleRepository as unknown as SaleRepositoryPort,
    );
  });

  it("Given: a DRAFT sale When: execute is called Then: should confirm the sale and publish event", async () => {
    // Arrange
    mockSaleRepository.findById.mockResolvedValue(mockSale);
    mockSaleRepository.confirm.mockResolvedValue(confirmedSale);

    // Act
    const result = await useCase.execute("sale-1");

    // Assert
    expect(mockSaleRepository.findById).toHaveBeenCalledWith("sale-1");
    expect(mockSaleRepository.confirm).toHaveBeenCalledWith("sale-1");
    expect(result).toBe(confirmedSale);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const publishedEvent = vi.mocked(eventBus.publish).mock.calls[0][0];
    expect(publishedEvent).toBeInstanceOf(SaleConfirmedEvent);
    expect(publishedEvent.aggregateId).toBe("sale-1");
    expect((publishedEvent as SaleConfirmedEvent).saleNumber).toBe("S-001");
    expect((publishedEvent as SaleConfirmedEvent).totalAmount).toBe(100);
  });

  it("Given: a non-existent sale When: execute is called Then: should throw NotFoundError", async () => {
    // Arrange
    mockSaleRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute("sale-999")).rejects.toThrow(NotFoundError);
    await expect(useCase.execute("sale-999")).rejects.toThrow(
      "Sale with id sale-999 not found",
    );
    expect(mockSaleRepository.confirm).not.toHaveBeenCalled();
  });

  it("Given: a sale that cannot be confirmed When: execute is called Then: should throw ValidationError", async () => {
    // Arrange
    const nonConfirmableSale = {
      ...mockSale,
      canConfirm: false,
      status: "CONFIRMED",
    };
    mockSaleRepository.findById.mockResolvedValue(nonConfirmableSale);

    // Act & Assert
    await expect(useCase.execute("sale-1")).rejects.toThrow(ValidationError);
    await expect(useCase.execute("sale-1")).rejects.toThrow(
      "Cannot confirm sale in CONFIRMED status or with no lines",
    );
    expect(mockSaleRepository.confirm).not.toHaveBeenCalled();
  });
});
