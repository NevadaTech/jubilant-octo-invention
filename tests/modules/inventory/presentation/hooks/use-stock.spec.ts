import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockFindAll = vi.fn();
const mockFindByProductAndWarehouse = vi.fn();

vi.mock("@/config/di/container", () => ({
  getContainer: vi.fn(() => ({
    stockRepository: {
      findAll: mockFindAll,
      findByProductAndWarehouse: mockFindByProductAndWarehouse,
    },
  })),
}));

import {
  useStock,
  useStockByLocation,
  stockKeys,
} from "@/modules/inventory/presentation/hooks/use-stock";

describe("use-stock hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Query Key Factory ──────────────────────────────────────────────

  describe("stockKeys", () => {
    it("Given the key factory, When calling all, Then it returns the base key", () => {
      expect(stockKeys.all).toEqual(["stock"]);
    });

    it("Given the key factory, When calling lists(), Then it returns the list key", () => {
      expect(stockKeys.lists()).toEqual(["stock", "list"]);
    });

    it("Given filters, When calling list(filters), Then it appends filters", () => {
      const filters = { warehouseId: "w-1" };
      expect(stockKeys.list(filters)).toEqual(["stock", "list", filters]);
    });

    it("Given the key factory, When calling byLocation(), Then it returns the location base key", () => {
      expect(stockKeys.byLocation()).toEqual(["stock", "location"]);
    });

    it("Given product and warehouse, When calling location(), Then it returns the full key", () => {
      expect(stockKeys.location("p-1", "w-1")).toEqual([
        "stock",
        "location",
        "p-1",
        "w-1",
      ]);
    });
  });

  // ── useStock ───────────────────────────────────────────────────────

  describe("useStock", () => {
    it("Given stock data exists, When the hook fetches, Then it returns the stock list", async () => {
      const mockData = {
        data: [
          {
            productId: "p-1",
            warehouseId: "w-1",
            quantity: 100,
            averageCost: 9.99,
          },
        ],
        pagination: { page: 1, limit: 10, total: 1 },
      };
      mockFindAll.mockResolvedValueOnce(mockData);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useStock(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindAll).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual(mockData);
    });

    it("Given filters, When the hook fetches, Then it passes filters to findAll", async () => {
      const filters = { productId: "p-1" };
      mockFindAll.mockResolvedValueOnce({ data: [], pagination: {} });
      const { Wrapper } = createQueryWrapper();

      renderHook(() => useStock(filters), { wrapper: Wrapper });

      await waitFor(() => expect(mockFindAll).toHaveBeenCalledWith(filters));
    });
  });

  // ── useStockByLocation ─────────────────────────────────────────────

  describe("useStockByLocation", () => {
    it("Given valid product and warehouse ids, When the hook fetches, Then it returns stock for that location", async () => {
      const mockStock = {
        productId: "p-1",
        warehouseId: "w-1",
        quantity: 50,
      };
      mockFindByProductAndWarehouse.mockResolvedValueOnce(mockStock);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(
        () => useStockByLocation("p-1", "w-1"),
        { wrapper: Wrapper },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindByProductAndWarehouse).toHaveBeenCalledWith("p-1", "w-1");
      expect(result.current.data).toEqual(mockStock);
    });

    it("Given an empty productId, When the hook renders, Then it does not fetch", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(
        () => useStockByLocation("", "w-1"),
        { wrapper: Wrapper },
      );

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockFindByProductAndWarehouse).not.toHaveBeenCalled();
    });

    it("Given an empty warehouseId, When the hook renders, Then it does not fetch", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(
        () => useStockByLocation("p-1", ""),
        { wrapper: Wrapper },
      );

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockFindByProductAndWarehouse).not.toHaveBeenCalled();
    });
  });
});
