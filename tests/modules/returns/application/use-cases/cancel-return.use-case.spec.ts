import { describe, it, expect, vi, beforeEach } from "vitest";
import { CancelReturnUseCase } from "@/modules/returns/application/use-cases/cancel-return.use-case";
import type { ReturnRepositoryPort } from "@/modules/returns/application/ports/return.repository.port";
import {
  NotFoundError,
  ValidationError,
} from "@/shared/domain/errors/domain-error";
import { ReturnCancelledEvent } from "@/modules/returns/domain/events/return.events";

vi.mock("@/shared/infrastructure/events", () => ({
  eventBus: {
    publish: vi.fn(),
    publishAll: vi.fn(),
    subscribe: vi.fn(),
    clear: vi.fn(),
  },
}));

import { eventBus } from "@/shared/infrastructure/events";

describe("CancelReturnUseCase", () => {
  let useCase: CancelReturnUseCase;
  let mockReturnRepository: {
    findById: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
  };

  const mockReturn = {
    id: "ret-1",
    returnNumber: "R-001",
    type: "RETURN_CUSTOMER",
    status: "DRAFT",
    canConfirm: true,
    canCancel: true,
  };

  const cancelledReturn = {
    ...mockReturn,
    id: "ret-1",
    returnNumber: "R-001",
    status: "CANCELLED",
    canConfirm: false,
    canCancel: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockReturnRepository = {
      findById: vi.fn(),
      cancel: vi.fn(),
    };
    useCase = new CancelReturnUseCase(
      mockReturnRepository as unknown as ReturnRepositoryPort,
    );
  });

  it("Given: a DRAFT return When: execute is called Then: should cancel the return and publish event", async () => {
    // Arrange
    mockReturnRepository.findById.mockResolvedValue(mockReturn);
    mockReturnRepository.cancel.mockResolvedValue(cancelledReturn);

    // Act
    const result = await useCase.execute("ret-1");

    // Assert
    expect(mockReturnRepository.findById).toHaveBeenCalledWith("ret-1");
    expect(mockReturnRepository.cancel).toHaveBeenCalledWith("ret-1");
    expect(result).toBe(cancelledReturn);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const publishedEvent = vi.mocked(eventBus.publish).mock.calls[0][0];
    expect(publishedEvent).toBeInstanceOf(ReturnCancelledEvent);
    expect(publishedEvent.aggregateId).toBe("ret-1");
    expect((publishedEvent as ReturnCancelledEvent).returnNumber).toBe(
      "R-001",
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
    expect(mockReturnRepository.cancel).not.toHaveBeenCalled();
  });

  it("Given: a return that cannot be cancelled When: execute is called Then: should throw ValidationError", async () => {
    // Arrange
    const cancelledAlready = {
      ...mockReturn,
      canCancel: false,
      status: "CANCELLED",
    };
    mockReturnRepository.findById.mockResolvedValue(cancelledAlready);

    // Act & Assert
    await expect(useCase.execute("ret-1")).rejects.toThrow(ValidationError);
    await expect(useCase.execute("ret-1")).rejects.toThrow(
      "Cannot cancel return in CANCELLED status",
    );
    expect(mockReturnRepository.cancel).not.toHaveBeenCalled();
  });
});
