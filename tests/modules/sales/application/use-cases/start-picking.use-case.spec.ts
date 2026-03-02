import { describe, it, expect, vi, beforeEach } from "vitest";
import { StartPickingUseCase } from "@/modules/sales/application/use-cases/start-picking.use-case";
import type { SaleRepositoryPort } from "@/modules/sales/application/ports/sale.repository.port";
import {
  NotFoundError,
  ValidationError,
} from "@/shared/domain/errors/domain-error";

describe("StartPickingUseCase", () => {
  let useCase: StartPickingUseCase;
  let mockSaleRepository: {
    findById: ReturnType<typeof vi.fn>;
    startPicking: ReturnType<typeof vi.fn>;
  };

  const mockSale = {
    id: "sale-1",
    saleNumber: "S-001",
    status: "CONFIRMED",
    totalAmount: 100,
    canConfirm: false,
    canCancel: true,
    canStartPicking: true,
    canShip: false,
    canComplete: false,
  };

  const pickingSale = {
    ...mockSale,
    status: "PICKING",
    canStartPicking: false,
    canShip: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSaleRepository = {
      findById: vi.fn(),
      startPicking: vi.fn(),
    };
    useCase = new StartPickingUseCase(
      mockSaleRepository as unknown as SaleRepositoryPort,
    );
  });

  it("Given: a CONFIRMED sale When: execute is called Then: should start picking and return updated sale", async () => {
    // Arrange
    mockSaleRepository.findById.mockResolvedValue(mockSale);
    mockSaleRepository.startPicking.mockResolvedValue(pickingSale);

    // Act
    const result = await useCase.execute("sale-1");

    // Assert
    expect(mockSaleRepository.findById).toHaveBeenCalledWith("sale-1");
    expect(mockSaleRepository.startPicking).toHaveBeenCalledWith("sale-1");
    expect(result).toBe(pickingSale);
    expect(result.status).toBe("PICKING");
  });

  it("Given: a non-existent sale When: execute is called Then: should throw NotFoundError", async () => {
    // Arrange
    mockSaleRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute("sale-999")).rejects.toThrow(NotFoundError);
    await expect(useCase.execute("sale-999")).rejects.toThrow(
      "Sale with id sale-999 not found",
    );
    expect(mockSaleRepository.startPicking).not.toHaveBeenCalled();
  });

  it("Given: a sale that cannot start picking When: execute is called Then: should throw ValidationError", async () => {
    // Arrange
    const draftSale = {
      ...mockSale,
      canStartPicking: false,
      status: "DRAFT",
    };
    mockSaleRepository.findById.mockResolvedValue(draftSale);

    // Act & Assert
    await expect(useCase.execute("sale-1")).rejects.toThrow(ValidationError);
    await expect(useCase.execute("sale-1")).rejects.toThrow(
      "Cannot start picking for sale in DRAFT status or picking is not enabled",
    );
    expect(mockSaleRepository.startPicking).not.toHaveBeenCalled();
  });
});
