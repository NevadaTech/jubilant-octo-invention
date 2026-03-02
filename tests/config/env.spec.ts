import { describe, it, expect } from "vitest";
import { env } from "@/config/env";

describe("env", () => {
  describe("defaults", () => {
    it("Given: no NEXT_PUBLIC_APP_URL env var When: accessing env.NEXT_PUBLIC_APP_URL Then: should return default localhost URL", () => {
      // Assert
      expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    });

    it("Given: no NEXT_PUBLIC_APP_NAME env var When: accessing env.NEXT_PUBLIC_APP_NAME Then: should return default app name", () => {
      // Assert
      expect(env.NEXT_PUBLIC_APP_NAME).toBe("Nevada Inventory System");
    });

    it("Given: no NEXT_PUBLIC_API_URL env var When: accessing env.NEXT_PUBLIC_API_URL Then: should return default API URL", () => {
      // Assert
      expect(env.NEXT_PUBLIC_API_URL).toBe("http://localhost:8080");
    });

    it("Given: no NEXT_PUBLIC_API_TIMEOUT env var When: accessing env.NEXT_PUBLIC_API_TIMEOUT Then: should return default 30000", () => {
      // Assert
      expect(env.NEXT_PUBLIC_API_TIMEOUT).toBe(30000);
    });

    it("Given: no NEXT_PUBLIC_ENABLE_MOCK_API env var When: accessing env.NEXT_PUBLIC_ENABLE_MOCK_API Then: should return false", () => {
      // Assert
      expect(env.NEXT_PUBLIC_ENABLE_MOCK_API).toBe(false);
    });
  });
});
