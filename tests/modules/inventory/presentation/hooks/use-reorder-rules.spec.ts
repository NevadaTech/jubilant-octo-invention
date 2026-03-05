import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockFindAll = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock(
  "@/modules/inventory/infrastructure/adapters/reorder-rule-api.adapter",
  () => ({
    reorderRuleApiAdapter: {
      findAll: (...args: any[]) => mockFindAll(...args),
      create: (...args: any[]) => mockCreate(...args),
      update: (...args: any[]) => mockUpdate(...args),
      delete: (...args: any[]) => mockDelete(...args),
    },
  }),
);

vi.mock("@/config/di/container", () => ({
  getContainer: () => ({
    stockRepository: {
      findAll: vi.fn(),
      findByProductAndWarehouse: vi.fn(),
    },
  }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import {
  useReorderRules,
  useCreateReorderRule,
  useUpdateReorderRule,
  useDeleteReorderRule,
  reorderRuleKeys,
} from "@/modules/inventory/presentation/hooks/use-reorder-rules";
import { toast } from "sonner";

describe("use-reorder-rules hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Query Key Factory ──────────────────────────────────────────────

  describe("reorderRuleKeys", () => {
    it("Given the key factory, When calling all, Then it returns the base key", () => {
      expect(reorderRuleKeys.all).toEqual(["reorder-rules"]);
    });

    it("Given the key factory, When calling lists(), Then it returns the list key", () => {
      expect(reorderRuleKeys.lists()).toEqual(["reorder-rules", "list"]);
    });
  });

  // ── useReorderRules ────────────────────────────────────────────────

  describe("useReorderRules", () => {
    it("Given reorder rules exist, When the hook fetches, Then it returns the list", async () => {
      const mockData = [
        { id: "rr-1", productId: "p-1", minQuantity: 10, maxQuantity: 100 },
      ];
      mockFindAll.mockResolvedValueOnce(mockData);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useReorderRules(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindAll).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockData);
    });
  });

  // ── useCreateReorderRule ───────────────────────────────────────────

  describe("useCreateReorderRule", () => {
    it("Given valid data, When mutate is called, Then it creates the rule and invalidates queries", async () => {
      mockCreate.mockResolvedValueOnce({ id: "rr-2" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreateReorderRule(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          productId: "p-1",
          warehouseId: "w-1",
          minQuantity: 10,
          maxQuantity: 100,
        });
      });

      expect(mockCreate).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("messages.created");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: reorderRuleKeys.all,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["stock"],
      });
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockCreate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCreateReorderRule(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            productId: "p-1",
            warehouseId: "w-1",
            minQuantity: 10,
            maxQuantity: 100,
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ── useUpdateReorderRule ───────────────────────────────────────────

  describe("useUpdateReorderRule", () => {
    it("Given valid data, When mutate is called, Then it updates and invalidates queries", async () => {
      mockUpdate.mockResolvedValueOnce({ id: "rr-1" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateReorderRule(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "rr-1",
          dto: { minQuantity: 20 },
        });
      });

      expect(mockUpdate).toHaveBeenCalledWith("rr-1", { minQuantity: 20 });
      expect(toast.success).toHaveBeenCalledWith("messages.updated");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: reorderRuleKeys.all,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["stock"],
      });
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockUpdate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useUpdateReorderRule(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            id: "rr-1",
            dto: { minQuantity: 0 },
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ── useDeleteReorderRule ───────────────────────────────────────────

  describe("useDeleteReorderRule", () => {
    it("Given a valid id, When mutate is called, Then it deletes and invalidates queries", async () => {
      mockDelete.mockResolvedValueOnce(undefined);
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useDeleteReorderRule(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync("rr-1");
      });

      expect(mockDelete).toHaveBeenCalledWith("rr-1");
      expect(toast.success).toHaveBeenCalledWith("messages.deleted");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: reorderRuleKeys.all,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["stock"],
      });
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockDelete.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useDeleteReorderRule(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync("rr-1");
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });
});
