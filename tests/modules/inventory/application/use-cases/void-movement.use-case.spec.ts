import { describe, it, expect, vi, beforeEach } from "vitest";
import { VoidMovementUseCase } from "@/modules/inventory/application/use-cases/void-movement.use-case";
import type { StockMovementRepositoryPort } from "@/modules/inventory/application/ports/stock-movement.repository.port";
import {
  NotFoundError,
  ValidationError,
} from "@/shared/domain/errors/domain-error";
import { MovementVoidedEvent } from "@/modules/inventory/domain/events/movement.events";

vi.mock("@/shared/infrastructure/events", () => ({
  eventBus: {
    publish: vi.fn(),
    publishAll: vi.fn(),
    subscribe: vi.fn(),
    clear: vi.fn(),
  },
}));

import { eventBus } from "@/shared/infrastructure/events";

describe("VoidMovementUseCase", () => {
  let useCase: VoidMovementUseCase;
  let mockMovementRepository: {
    findById: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    void: ReturnType<typeof vi.fn>;
  };

  const mockMovement = {
    id: "mov-1",
    reference: "REF-001",
    type: "IN",
    status: "POSTED",
    canPost: false,
    canVoid: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockMovementRepository = {
      findById: vi.fn(),
      post: vi.fn(),
      void: vi.fn(),
    };
    useCase = new VoidMovementUseCase(
      mockMovementRepository as unknown as StockMovementRepositoryPort,
    );
  });

  it("Given: a POSTED movement When: execute is called Then: should void the movement and publish event", async () => {
    // Arrange
    mockMovementRepository.findById.mockResolvedValue(mockMovement);
    mockMovementRepository.void.mockResolvedValue(undefined);

    // Act
    await useCase.execute("mov-1");

    // Assert
    expect(mockMovementRepository.findById).toHaveBeenCalledWith("mov-1");
    expect(mockMovementRepository.void).toHaveBeenCalledWith("mov-1");
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const publishedEvent = vi.mocked(eventBus.publish).mock.calls[0][0];
    expect(publishedEvent).toBeInstanceOf(MovementVoidedEvent);
    expect(publishedEvent.aggregateId).toBe("mov-1");
    expect((publishedEvent as MovementVoidedEvent).movementNumber).toBe(
      "REF-001",
    );
  });

  it("Given: a non-existent movement When: execute is called Then: should throw NotFoundError", async () => {
    // Arrange
    mockMovementRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute("mov-999")).rejects.toThrow(NotFoundError);
    await expect(useCase.execute("mov-999")).rejects.toThrow(
      "StockMovement with id mov-999 not found",
    );
    expect(mockMovementRepository.void).not.toHaveBeenCalled();
  });

  it("Given: a movement that cannot be voided When: execute is called Then: should throw ValidationError", async () => {
    // Arrange
    const draftMovement = { ...mockMovement, canVoid: false, status: "DRAFT" };
    mockMovementRepository.findById.mockResolvedValue(draftMovement);

    // Act & Assert
    await expect(useCase.execute("mov-1")).rejects.toThrow(ValidationError);
    await expect(useCase.execute("mov-1")).rejects.toThrow(
      "Cannot void movement in DRAFT status",
    );
    expect(mockMovementRepository.void).not.toHaveBeenCalled();
  });

  it("Given: a movement with null reference When: execute is called Then: should use movementId as fallback in event", async () => {
    // Arrange
    const movementNoRef = { ...mockMovement, reference: null };
    mockMovementRepository.findById.mockResolvedValue(movementNoRef);
    mockMovementRepository.void.mockResolvedValue(undefined);

    // Act
    await useCase.execute("mov-1");

    // Assert
    const publishedEvent = vi.mocked(eventBus.publish).mock
      .calls[0][0] as MovementVoidedEvent;
    expect(publishedEvent.movementNumber).toBe("mov-1");
  });
});
