import { describe, it, expect, beforeEach } from "vitest";

// Use dynamic import so each test can get a fresh module if needed
// but for createContainer we can import directly since it always creates new instances
import {
  createContainer,
  getContainer,
  setContainer,
} from "@/config/di/container";

describe("DI Container", () => {
  describe("createContainer", () => {
    it("Given: no arguments When: calling createContainer Then: should return object with all repository keys", () => {
      // Act
      const container = createContainer();

      // Assert
      expect(container.authRepository).toBeDefined();
      expect(container.productRepository).toBeDefined();
      expect(container.categoryRepository).toBeDefined();
      expect(container.warehouseRepository).toBeDefined();
      expect(container.stockRepository).toBeDefined();
      expect(container.movementRepository).toBeDefined();
      expect(container.transferRepository).toBeDefined();
      expect(container.saleRepository).toBeDefined();
      expect(container.returnRepository).toBeDefined();
      expect(container.userRepository).toBeDefined();
      expect(container.roleRepository).toBeDefined();
      expect(container.auditLogRepository).toBeDefined();
      expect(container.reportRepository).toBeDefined();
      expect(container.settingsRepository).toBeDefined();
    });

    it("Given: no arguments When: calling createContainer Then: should return object with all use case keys", () => {
      // Act
      const container = createContainer();

      // Assert
      expect(container.postMovement).toBeDefined();
      expect(container.voidMovement).toBeDefined();
      expect(container.confirmSale).toBeDefined();
      expect(container.cancelSale).toBeDefined();
      expect(container.startPicking).toBeDefined();
      expect(container.shipSale).toBeDefined();
      expect(container.completeSale).toBeDefined();
      expect(container.confirmReturn).toBeDefined();
      expect(container.cancelReturn).toBeDefined();
    });
  });

  describe("getContainer", () => {
    it("Given: getContainer called multiple times When: comparing results Then: should return same instance", () => {
      // Act
      const container1 = getContainer();
      const container2 = getContainer();

      // Assert
      expect(container1).toBe(container2);
    });
  });

  describe("setContainer", () => {
    it("Given: a mock repository override When: calling setContainer Then: should use overridden repository", () => {
      // Arrange
      const mockProductRepo = { list: "mocked" } as unknown as ReturnType<
        typeof createContainer
      >["productRepository"];

      // Act
      const restore = setContainer({ productRepository: mockProductRepo });
      const container = getContainer();

      // Assert
      expect(container.productRepository).toBe(mockProductRepo);

      // Cleanup
      restore();
    });

    it("Given: overridden container When: calling restore function Then: should restore original container", () => {
      // Arrange
      const original = getContainer();
      const originalProductRepo = original.productRepository;
      const mockProductRepo = { list: "mocked" } as unknown as ReturnType<
        typeof createContainer
      >["productRepository"];

      // Act
      const restore = setContainer({ productRepository: mockProductRepo });
      restore();
      const restored = getContainer();

      // Assert
      expect(restored.productRepository).toBe(originalProductRepo);
    });
  });
});
