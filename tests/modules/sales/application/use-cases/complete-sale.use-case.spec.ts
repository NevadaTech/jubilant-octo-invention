import { describe, it, expect, vi, beforeEach } from "vitest";
import { CompleteSaleUseCase } from "@/modules/sales/application/use-cases/complete-sale.use-case";
import type { SaleRepositoryPort } from "@/modules/sales/application/ports/sale.repository.port";
import {
  NotFoundError,
  ValidationError,
} from "@/shared/domain/errors/domain-error";
import { SaleCompletedEvent } from "@/modules/sales/domain/events/sale.events";

vi.mock("@/shared/infrastructure/events", () => ({
  eventBus: {
    publish: vi.fn(),
    publishAll: vi.fn(),
    subscribe: vi.fn(),
    clear: vi.fn(),
  },
}));

import { eventBus } from "@/shared/infrastructure/events";

describe("CompleteSaleUseCase", () => {
  let useCase: CompleteSaleUseCase;
  let mockSaleRepository: {
    findById: ReturnType<typeof vi.fn>;
    complete: ReturnType<typeof vi.fn>;
  };

  const mockSale = {
    id: "sale-1",
    saleNumber: "S-001",
    status: "SHIPPED",
    totalAmount: 100,
    canConfirm: false,
    canCancel: false,
    canStartPicking: false,
    canShip: false,
    canComplete: true,
  };

  const completedSale = {
    ...mockSale,
    id: "sale-1",
    saleNumber: "S-001",
    status: "COMPLETED",
    canComplete: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSaleRepository = {
      findById: vi.fn(),
      complete: vi.fn(),
    };
    useCase = new CompleteSaleUseCase(
      mockSaleRepository as unknown as SaleRepositoryPort,
    );
  });

  it("Given: a SHIPPED sale When: execute is called Then: should complete the sale and publish event", async () => {
    // Arrange
    mockSaleRepository.findById.mockResolvedValue(mockSale);
    mockSaleRepository.complete.mockResolvedValue(completedSale);

    // Act
    const result = await useCase.execute("sale-1");

    // Assert
    expect(mockSaleRepository.findById).toHaveBeenCalledWith("sale-1");
    expect(mockSaleRepository.complete).toHaveBeenCalledWith("sale-1");
    expect(result).toBe(completedSale);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const publishedEvent = vi.mocked(eventBus.publish).mock.calls[0][0];
    expect(publishedEvent).toBeInstanceOf(SaleCompletedEvent);
    expect(publishedEvent.aggregateId).toBe("sale-1");
    expect((publishedEvent as SaleCompletedEvent).saleNumber).toBe("S-001");
  });

  it("Given: a non-existent sale When: execute is called Then: should throw NotFoundError", async () => {
    // Arrange
    mockSaleRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute("sale-999")).rejects.toThrow(NotFoundError);
    await expect(useCase.execute("sale-999")).rejects.toThrow(
      "Sale with id sale-999 not found",
    );
    expect(mockSaleRepository.complete).not.toHaveBeenCalled();
  });

  it("Given: a sale that cannot be completed When: execute is called Then: should throw ValidationError", async () => {
    // Arrange
    const draftSale = { ...mockSale, canComplete: false, status: "DRAFT" };
    mockSaleRepository.findById.mockResolvedValue(draftSale);

    // Act & Assert
    await expect(useCase.execute("sale-1")).rejects.toThrow(ValidationError);
    await expect(useCase.execute("sale-1")).rejects.toThrow(
      "Cannot complete sale in DRAFT status or picking is not enabled",
    );
    expect(mockSaleRepository.complete).not.toHaveBeenCalled();
  });
});
