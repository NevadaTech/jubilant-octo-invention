import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/shared/infrastructure/http", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from "@/shared/infrastructure/http";
import { reorderRuleApiAdapter } from "@/modules/inventory/infrastructure/adapters/reorder-rule-api.adapter";
import type { ReorderRuleApiDto } from "@/modules/inventory/application/dto/reorder-rule.dto";

describe("ReorderRuleApiAdapter", () => {
  const mockRuleDto: ReorderRuleApiDto = {
    id: "rule-001",
    productId: "prod-001",
    warehouseId: "wh-001",
    minQty: 10,
    maxQty: 100,
    safetyQty: 15,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    it("Given: rules exist When: findAll is called Then: should GET /inventory/stock/reorder-rules and return data array", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "OK",
          data: [mockRuleDto],
          timestamp: "2025-01-15T10:00:00.000Z",
        },
        status: 200,
        headers: {},
      });

      const result = await reorderRuleApiAdapter.findAll();

      expect(apiClient.get).toHaveBeenCalledWith("/inventory/stock/reorder-rules");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockRuleDto);
    });

    it("Given: no rules exist When: findAll is called Then: should return empty array", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "OK",
          data: [],
          timestamp: "2025-01-15T10:00:00.000Z",
        },
        status: 200,
        headers: {},
      });

      const result = await reorderRuleApiAdapter.findAll();

      expect(result).toEqual([]);
    });

    it("Given: API response with null data When: findAll is called Then: should default to empty array", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          message: "OK",
          data: null,
          timestamp: "2025-01-15T10:00:00.000Z",
        },
        status: 200,
        headers: {},
      });

      const result = await reorderRuleApiAdapter.findAll();

      expect(result).toEqual([]);
    });
  });

  describe("create", () => {
    it("Given: valid create data When: create is called Then: should POST and return the created rule", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          message: "Created",
          data: mockRuleDto,
          timestamp: "2025-01-15T10:00:00.000Z",
        },
        status: 201,
        headers: {},
      });

      const createDto = {
        productId: "prod-001",
        warehouseId: "wh-001",
        minQty: 10,
        maxQty: 100,
        safetyQty: 15,
      };
      const result = await reorderRuleApiAdapter.create(createDto);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/inventory/stock/reorder-rules",
        createDto,
      );
      expect(result).toEqual(mockRuleDto);
    });
  });

  describe("update", () => {
    it("Given: valid update data When: update is called Then: should PUT and return the updated rule", async () => {
      const updatedRule = { ...mockRuleDto, minQty: 20 };
      vi.mocked(apiClient.put).mockResolvedValue({
        data: {
          success: true,
          message: "Updated",
          data: updatedRule,
          timestamp: "2025-01-15T10:00:00.000Z",
        },
        status: 200,
        headers: {},
      });

      const updateDto = { minQty: 20 };
      const result = await reorderRuleApiAdapter.update("rule-001", updateDto);

      expect(apiClient.put).toHaveBeenCalledWith(
        "/inventory/stock/reorder-rules/rule-001",
        updateDto,
      );
      expect(result).toEqual(updatedRule);
    });

    it("Given: partial update data When: update is called Then: should only send provided fields", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({
        data: {
          success: true,
          message: "Updated",
          data: { ...mockRuleDto, safetyQty: 25 },
          timestamp: "2025-01-15T10:00:00.000Z",
        },
        status: 200,
        headers: {},
      });

      const updateDto = { safetyQty: 25 };
      await reorderRuleApiAdapter.update("rule-001", updateDto);

      expect(apiClient.put).toHaveBeenCalledWith(
        "/inventory/stock/reorder-rules/rule-001",
        { safetyQty: 25 },
      );
    });
  });

  describe("delete", () => {
    it("Given: a valid rule ID When: delete is called Then: should DELETE /inventory/stock/reorder-rules/:id", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        data: undefined,
        status: 204,
        headers: {},
      });

      await reorderRuleApiAdapter.delete("rule-001");

      expect(apiClient.delete).toHaveBeenCalledWith(
        "/inventory/stock/reorder-rules/rule-001",
      );
    });

    it("Given: delete succeeds When: delete is called Then: should not throw", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        data: undefined,
        status: 204,
        headers: {},
      });

      await expect(reorderRuleApiAdapter.delete("rule-001")).resolves.toBeUndefined();
    });
  });
});
