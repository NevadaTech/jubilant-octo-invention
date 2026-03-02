import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConfirmReturnUseCase } from "@/modules/returns/application/use-cases/confirm-return.use-case";
import type { ReturnRepositoryPort } from "@/modules/returns/application/ports/return.repository.port";
import {
  NotFoundError,
  ValidationError,
} from "@/shared/domain/errors/domain-error";
import { ReturnConfirmedEvent } from "@/modules/returns/domain/events/return.events";

vi.mock("@/shared/infrastructure/events", () => ({
  eventBus: {
    publish: vi.fn(),
    publishAll: vi.fn(),
    subscribe: vi.fn(),
    clear: vi.fn(),
  },
}));

import { eventBus } from "@/shared/infrastructure/events";

describe("ConfirmReturnUseCase", () => {
  let useCase: ConfirmReturnUseCase;
  let mockReturnRepository: {
    findById: ReturnType<typeof vi.fn>;
    confirm: ReturnType<typeof vi.fn>;
  };

  const mockReturn = {
    id: "ret-1",
    returnNumber: "R-001",
    type: "RETURN_CUSTOMER",
    status: "DRAFT",
    canConfirm: true,
    canCancel: true,
  };

  const confirmedReturn = {
    ...mockReturn,
    id: "ret-1",
    returnNumber: "R-001",
    type: "RETURN_CUSTOMER",
    status: "CONFIRMED",
    canConfirm: false,
    canCancel: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockReturnRepository = {
      findById: vi.fn(),
      confirm: vi.fn(),
    };
    useCase = new ConfirmReturnUseCase(
      mockReturnRepository as unknown as ReturnRepositoryPort,
    );
  });

  it("Given: a DRAFT return When: execute is called Then: should confirm the return and publish event", async () => {
    // Arrange
    mockReturnRepository.findById.mockResolvedValue(mockReturn);
    mockReturnRepository.confirm.mockResolvedValue(confirmedReturn);

    // Act
    const result = await useCase.execute("ret-1");

    // Assert
    expect(mockReturnRepository.findById).toHaveBeenCalledWith("ret-1");
    expect(mockReturnRepository.confirm).toHaveBeenCalledWith("ret-1");
    expect(result).toBe(confirmedReturn);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const publishedEvent = vi.mocked(eventBus.publish).mock.calls[0][0];
    expect(publishedEvent).toBeInstanceOf(ReturnConfirmedEvent);
    expect(publishedEvent.aggregateId).toBe("ret-1");
    expect((publishedEvent as ReturnConfirmedEvent).returnNumber).toBe(
      "R-001",
    );
    expect((publishedEvent as ReturnConfirmedEvent).type).toBe(
      "RETURN_CUSTOMER",
    );
  });

  it("Given: a non-existent return When: execute is called Then: should throw NotFoundError", async () => {
    // Arrange
    mockReturnRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute("ret-999")).rejects.toThrow(NotFoundError);
    await expect(useCase.execute("ret-999")).rejects.toThrow(
      "Return with id ret-999 not found",
    );
    expect(mockReturnRepository.confirm).not.toHaveBeenCalled();
  });

  it("Given: a return that cannot be confirmed When: execute is called Then: should throw ValidationError", async () => {
    // Arrange
    const confirmedAlready = {
      ...mockReturn,
      canConfirm: false,
      status: "CONFIRMED",
    };
    mockReturnRepository.findById.mockResolvedValue(confirmedAlready);

    // Act & Assert
    await expect(useCase.execute("ret-1")).rejects.toThrow(ValidationError);
    await expect(useCase.execute("ret-1")).rejects.toThrow(
      "Cannot confirm return in CONFIRMED status or with no lines",
    );
    expect(mockReturnRepository.confirm).not.toHaveBeenCalled();
  });
});
