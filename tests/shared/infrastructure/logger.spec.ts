import { describe, it, expect, vi, afterEach } from "vitest";
import { logger } from "@/shared/infrastructure/logger";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("error", () => {
    it("Given: development env When: logger.error is called Then: should call console.error", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      logger.error("test error", { detail: 1 });

      expect(spy).toHaveBeenCalledWith("test error", { detail: 1 });
    });

    it("Given: logger.error When: called with multiple arguments Then: should pass all through", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      logger.error("a", "b", "c");

      expect(spy).toHaveBeenCalledWith("a", "b", "c");
    });
  });

  describe("warn", () => {
    it("Given: development env When: logger.warn is called Then: should call console.warn", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

      logger.warn("test warning", 42);

      expect(spy).toHaveBeenCalledWith("test warning", 42);
    });

    it("Given: logger.warn When: called with multiple arguments Then: should pass all through", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

      logger.warn(1, 2, 3);

      expect(spy).toHaveBeenCalledWith(1, 2, 3);
    });
  });

  describe("production mode", () => {
    it("Given: production env When: logger.error is called Then: should NOT call console.error", async () => {
      // Re-import with production env
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      // Clear module cache and re-import
      vi.resetModules();
      const { logger: prodLogger } =
        await import("@/shared/infrastructure/logger");

      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      prodLogger.error("should not appear");

      expect(spy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it("Given: production env When: logger.warn is called Then: should NOT call console.warn", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      vi.resetModules();
      const { logger: prodLogger } =
        await import("@/shared/infrastructure/logger");

      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

      prodLogger.warn("should not appear");

      expect(spy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });
});
