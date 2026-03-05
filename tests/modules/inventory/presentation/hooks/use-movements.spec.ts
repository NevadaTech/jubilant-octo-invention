import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockFindAll = vi.fn();
const mockFindById = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockPost = vi.fn();
const mockVoid = vi.fn();

vi.mock("@/config/di/container", () => ({
  getContainer: vi.fn(() => ({
    movementRepository: {
      findAll: mockFindAll,
      findById: mockFindById,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
      post: mockPost,
      void: mockVoid,
    },
    stockRepository: {
      findAll: vi.fn(),
    },
  })),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import {
  useMovements,
  useMovement,
  useCreateMovement,
  useUpdateMovement,
  useDeleteMovement,
  usePostMovement,
  useVoidMovement,
  movementKeys,
} from "@/modules/inventory/presentation/hooks/use-movements";
import { toast } from "sonner";

describe("use-movements hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Query Key Factory ──────────────────────────────────────────────

  describe("movementKeys", () => {
    it("Given the key factory, When calling all, Then it returns the base key", () => {
      expect(movementKeys.all).toEqual(["movements"]);
    });

    it("Given the key factory, When calling lists(), Then it returns the list key", () => {
      expect(movementKeys.lists()).toEqual(["movements", "list"]);
    });

    it("Given filters, When calling list(filters), Then it appends filters", () => {
      const filters = { type: "IN" };
      expect(movementKeys.list(filters)).toEqual([
        "movements",
        "list",
        filters,
      ]);
    });

    it("Given an id, When calling detail(id), Then it returns the detail key", () => {
      expect(movementKeys.detail("m-1")).toEqual([
        "movements",
        "detail",
        "m-1",
      ]);
    });
  });

  // ── useMovements ───────────────────────────────────────────────────

  describe("useMovements", () => {
    it("Given movements exist, When the hook fetches, Then it returns the movement list", async () => {
      const mockData = {
        data: [{ id: "m-1", type: "IN", status: "DRAFT" }],
        pagination: { page: 1, limit: 10, total: 1 },
      };
      mockFindAll.mockResolvedValueOnce(mockData);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useMovements(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindAll).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual(mockData);
    });
  });

  // ── useMovement ────────────────────────────────────────────────────

  describe("useMovement", () => {
    it("Given a valid id, When the hook fetches, Then it returns the movement", async () => {
      const movement = { id: "m-1", type: "IN", status: "DRAFT" };
      mockFindById.mockResolvedValueOnce(movement);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useMovement("m-1"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindById).toHaveBeenCalledWith("m-1");
      expect(result.current.data).toEqual(movement);
    });

    it("Given an empty id, When the hook renders, Then it does not fetch", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useMovement(""), {
        wrapper: Wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockFindById).not.toHaveBeenCalled();
    });
  });

  // ── useCreateMovement ──────────────────────────────────────────────

  describe("useCreateMovement", () => {
    it("Given valid data, When mutate is called, Then it creates the movement and shows success toast", async () => {
      mockCreate.mockResolvedValueOnce({ id: "m-2" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreateMovement(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ type: "IN", productId: "p-1" });
      });

      expect(mockCreate).toHaveBeenCalledWith({
        type: "IN",
        productId: "p-1",
      });
      expect(toast.success).toHaveBeenCalledWith("messages.created");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: movementKeys.lists(),
      });
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockCreate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCreateMovement(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ type: "IN", productId: "p-1" });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ── useUpdateMovement ──────────────────────────────────────────────

  describe("useUpdateMovement", () => {
    it("Given valid data, When mutate is called, Then it updates and invalidates queries", async () => {
      mockUpdate.mockResolvedValueOnce({ id: "m-1" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateMovement(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "m-1",
          data: { quantity: 50 },
        });
      });

      expect(mockUpdate).toHaveBeenCalledWith("m-1", { quantity: 50 });
      expect(toast.success).toHaveBeenCalledWith("messages.updated");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: movementKeys.lists(),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: movementKeys.detail("m-1"),
      });
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockUpdate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useUpdateMovement(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            id: "m-1",
            data: { quantity: 0 },
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ── useDeleteMovement ──────────────────────────────────────────────

  describe("useDeleteMovement", () => {
    it("Given a valid id, When mutate is called, Then it deletes and shows success toast", async () => {
      mockDelete.mockResolvedValueOnce(undefined);
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useDeleteMovement(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync("m-1");
      });

      expect(mockDelete).toHaveBeenCalledWith("m-1");
      expect(toast.success).toHaveBeenCalledWith("messages.deleted");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: movementKeys.lists(),
      });
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockDelete.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useDeleteMovement(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync("m-1");
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ── usePostMovement ────────────────────────────────────────────────

  describe("usePostMovement", () => {
    it("Given a draft movement, When posting, Then it posts and invalidates movement + stock queries", async () => {
      mockPost.mockResolvedValueOnce({ id: "m-1", status: "POSTED" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => usePostMovement(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync("m-1");
      });

      expect(mockPost).toHaveBeenCalledWith("m-1");
      expect(toast.success).toHaveBeenCalledWith("messages.posted");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: movementKeys.lists(),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: movementKeys.detail("m-1"),
      });
      // Also invalidates stock queries
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["stock", "list"],
      });
    });

    it("Given a server error, When posting, Then it shows error toast", async () => {
      mockPost.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => usePostMovement(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync("m-1");
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ── useVoidMovement ────────────────────────────────────────────────

  describe("useVoidMovement", () => {
    it("Given a posted movement, When voiding, Then it voids and invalidates movement + stock queries", async () => {
      mockVoid.mockResolvedValueOnce({ id: "m-1", status: "VOID" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useVoidMovement(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync("m-1");
      });

      expect(mockVoid).toHaveBeenCalledWith("m-1");
      expect(toast.success).toHaveBeenCalledWith("messages.voided");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: movementKeys.lists(),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: movementKeys.detail("m-1"),
      });
      // Also invalidates stock queries
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["stock", "list"],
      });
    });

    it("Given a server error, When voiding, Then it shows error toast", async () => {
      mockVoid.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useVoidMovement(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync("m-1");
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });
});
