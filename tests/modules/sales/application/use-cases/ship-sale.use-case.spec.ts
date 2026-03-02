import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ShipSaleUseCase,
  type ShipSaleInput,
} from "@/modules/sales/application/use-cases/ship-sale.use-case";
import type { SaleRepositoryPort } from "@/modules/sales/application/ports/sale.repository.port";
import {
  NotFoundError,
  ValidationError,
} from "@/shared/domain/errors/domain-error";

describe("ShipSaleUseCase", () => {
  let useCase: ShipSaleUseCase;
  let mockSaleRepository: {
    findById: ReturnType<typeof vi.fn>;
    ship: ReturnType<typeof vi.fn>;
  };

  const mockSale = {
    id: "sale-1",
    saleNumber: "S-001",
    status: "PICKING",
    totalAmount: 100,
    canConfirm: false,
    canCancel: false,
    canStartPicking: false,
    canShip: true,
    canComplete: false,
  };

  const shippingData = {
    trackingNumber: "TRACK-123",
    shippingCarrier: "FedEx",
    shippingNotes: "Handle with care",
  };

  const shippedSale = {
    ...mockSale,
    status: "SHIPPED",
    canShip: false,
    canComplete: true,
    trackingNumber: "TRACK-123",
    shippingCarrier: "FedEx",
    shippingNotes: "Handle with care",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSaleRepository = {
      findById: vi.fn(),
      ship: vi.fn(),
    };
    useCase = new ShipSaleUseCase(
      mockSaleRepository as unknown as SaleRepositoryPort,
    );
  });

  it("Given: a PICKING sale with shipping data When: execute is called Then: should ship the sale and return updated sale", async () => {
    // Arrange
    mockSaleRepository.findById.mockResolvedValue(mockSale);
    mockSaleRepository.ship.mockResolvedValue(shippedSale);
    const input: ShipSaleInput = {
      saleId: "sale-1",
      data: shippingData,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(mockSaleRepository.findById).toHaveBeenCalledWith("sale-1");
    expect(mockSaleRepository.ship).toHaveBeenCalledWith(
      "sale-1",
      shippingData,
    );
    expect(result).toBe(shippedSale);
    expect(result.status).toBe("SHIPPED");
    expect(result.trackingNumber).toBe("TRACK-123");
  });

  it("Given: a non-existent sale When: execute is called Then: should throw NotFoundError", async () => {
    // Arrange
    mockSaleRepository.findById.mockResolvedValue(null);
    const input: ShipSaleInput = {
      saleId: "sale-999",
      data: shippingData,
    };

    // Act & Assert
    await expect(useCase.execute(input)).rejects.toThrow(NotFoundError);
    await expect(useCase.execute(input)).rejects.toThrow(
      "Sale with id sale-999 not found",
    );
    expect(mockSaleRepository.ship).not.toHaveBeenCalled();
  });

  it("Given: a sale that cannot be shipped When: execute is called Then: should throw ValidationError", async () => {
    // Arrange
    const draftSale = { ...mockSale, canShip: false, status: "DRAFT" };
    mockSaleRepository.findById.mockResolvedValue(draftSale);
    const input: ShipSaleInput = {
      saleId: "sale-1",
      data: shippingData,
    };

    // Act & Assert
    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    await expect(useCase.execute(input)).rejects.toThrow(
      "Cannot ship sale in DRAFT status or picking is not enabled",
    );
    expect(mockSaleRepository.ship).not.toHaveBeenCalled();
  });
});
