import { describe, it, expect, vi, beforeEach } from "vitest";
import { CancelSaleUseCase } from "@/modules/sales/application/use-cases/cancel-sale.use-case";
import type { SaleRepositoryPort } from "@/modules/sales/application/ports/sale.repository.port";
import {
  NotFoundError,
  ValidationError,
} from "@/shared/domain/errors/domain-error";
import { SaleCancelledEvent } from "@/modules/sales/domain/events/sale.events";

vi.mock("@/shared/infrastructure/events", () => ({
  eventBus: {
    publish: vi.fn(),
    publishAll: vi.fn(),
    subscribe: vi.fn(),
    clear: vi.fn(),
  },
}));

import { eventBus } from "@/shared/infrastructure/events";

describe("CancelSaleUseCase", () => {
  let useCase: CancelSaleUseCase;
  let mockSaleRepository: {
    findById: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
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

  const cancelledSale = {
    ...mockSale,
    id: "sale-1",
    saleNumber: "S-001",
    status: "CANCELLED",
    canCancel: false,
    canConfirm: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSaleRepository = {
      findById: vi.fn(),
      cancel: vi.fn(),
    };
    useCase = new CancelSaleUseCase(
      mockSaleRepository as unknown as SaleRepositoryPort,
    );
  });

  it("Given: a DRAFT sale When: execute is called Then: should cancel the sale and publish event", async () => {
    // Arrange
    mockSaleRepository.findById.mockResolvedValue(mockSale);
    mockSaleRepository.cancel.mockResolvedValue(cancelledSale);

    // Act
    const result = await useCase.execute("sale-1");

    // Assert
    expect(mockSaleRepository.findById).toHaveBeenCalledWith("sale-1");
    expect(mockSaleRepository.cancel).toHaveBeenCalledWith("sale-1");
    expect(result).toBe(cancelledSale);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const publishedEvent = vi.mocked(eventBus.publish).mock.calls[0][0];
    expect(publishedEvent).toBeInstanceOf(SaleCancelledEvent);
    expect(publishedEvent.aggregateId).toBe("sale-1");
    expect((publishedEvent as SaleCancelledEvent).saleNumber).toBe("S-001");
  });

  it("Given: a non-existent sale When: execute is called Then: should throw NotFoundError", async () => {
    // Arrange
    mockSaleRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute("sale-999")).rejects.toThrow(NotFoundError);
    await expect(useCase.execute("sale-999")).rejects.toThrow(
      "Sale with id sale-999 not found",
    );
    expect(mockSaleRepository.cancel).not.toHaveBeenCalled();
  });

  it("Given: a sale that cannot be cancelled When: execute is called Then: should throw ValidationError", async () => {
    // Arrange
    const completedSale = {
      ...mockSale,
      canCancel: false,
      status: "COMPLETED",
    };
    mockSaleRepository.findById.mockResolvedValue(completedSale);

    // Act & Assert
    await expect(useCase.execute("sale-1")).rejects.toThrow(ValidationError);
    await expect(useCase.execute("sale-1")).rejects.toThrow(
      "Cannot cancel sale in COMPLETED status",
    );
    expect(mockSaleRepository.cancel).not.toHaveBeenCalled();
  });
});
