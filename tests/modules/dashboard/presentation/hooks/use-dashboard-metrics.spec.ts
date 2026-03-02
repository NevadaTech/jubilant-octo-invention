import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockGetMetrics = vi.fn();

vi.mock(
  "@/modules/dashboard/infrastructure/services/dashboard-api.service",
  () => ({
    dashboardApiService: {
      getMetrics: (...args: any[]) => mockGetMetrics(...args),
    },
  }),
);

let mockIsHydrated = true;
let mockIsAuthenticated = true;

vi.mock("@/modules/authentication/presentation/store/auth.store", () => ({
  useAuthStore: (selector: (state: any) => any) => {
    const state = {
      isHydrated: mockIsHydrated,
      isAuthenticated: mockIsAuthenticated,
      user: null,
      isLoading: false,
      error: null,
    };
    return selector(state);
  },
}));

import { useDashboardMetrics } from "@/modules/dashboard/presentation/hooks/use-dashboard-metrics";

describe("use-dashboard-metrics hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsHydrated = true;
    mockIsAuthenticated = true;
  });

  // ── Successful Fetch ───────────────────────────────────────────────

  describe("useDashboardMetrics", () => {
    it("Given authenticated user, When the hook fetches, Then it returns metrics data", async () => {
      const mockMetrics = {
        inventorySummary: { totalProducts: 100, totalValue: 50000 },
        lowStockCount: 5,
        monthlySales: { total: 10000, count: 25 },
        salesTrend: [],
        topProducts: [],
        stockByWarehouse: [],
        recentActivity: [],
      };
      mockGetMetrics.mockResolvedValueOnce(mockMetrics);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useDashboardMetrics(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.metrics).toBeDefined());

      expect(mockGetMetrics).toHaveBeenCalled();
      expect(result.current.metrics).toEqual(mockMetrics);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it("Given unauthenticated user, When the hook renders, Then it does not fetch and isLoading is false", () => {
      mockIsAuthenticated = false;
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useDashboardMetrics(), {
        wrapper: Wrapper,
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.metrics).toBeUndefined();
      expect(mockGetMetrics).not.toHaveBeenCalled();
    });

    it("Given not hydrated yet, When the hook renders, Then it does not fetch and isLoading is false", () => {
      mockIsHydrated = false;
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useDashboardMetrics(), {
        wrapper: Wrapper,
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.metrics).toBeUndefined();
      expect(mockGetMetrics).not.toHaveBeenCalled();
    });

    it("Given a server error, When the hook fetches with retry exhausted, Then it reports the error", async () => {
      // The hook has retry: 1, so we need to fail twice (initial + 1 retry)
      mockGetMetrics
        .mockRejectedValueOnce(new Error("Server error"))
        .mockRejectedValueOnce(new Error("Server error"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useDashboardMetrics(), {
        wrapper: Wrapper,
      });

      await waitFor(
        () => expect(result.current.isError).toBe(true),
        { timeout: 10000 },
      );

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.metrics).toBeUndefined();
    });

    it("Given a successful fetch, When checking refetch, Then it returns a refetch function", async () => {
      mockGetMetrics.mockResolvedValueOnce({
        inventorySummary: {},
        lowStockCount: 0,
      });
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useDashboardMetrics(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.metrics).toBeDefined());

      expect(typeof result.current.refetch).toBe("function");
    });
  });
});
