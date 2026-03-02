import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockFindAll = vi.fn();
const mockFindById = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockConfirm = vi.fn();
const mockCancel = vi.fn();
const mockAddLine = vi.fn();
const mockRemoveLine = vi.fn();

vi.mock("@/config/di/container", () => ({
  getContainer: vi.fn(() => ({
    returnRepository: {
      findAll: mockFindAll,
      findById: mockFindById,
      create: mockCreate,
      update: mockUpdate,
      confirm: mockConfirm,
      cancel: mockCancel,
      addLine: mockAddLine,
      removeLine: mockRemoveLine,
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
  useReturns,
  useReturn,
  useCreateReturn,
  useUpdateReturn,
  useConfirmReturn,
  useCancelReturn,
  useAddReturnLine,
  useRemoveReturnLine,
} from "@/modules/returns/presentation/hooks/use-returns";
import { toast } from "sonner";

describe("use-returns hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── useReturns ─────────────────────────────────────────────────────

  describe("useReturns", () => {
    it("Given returns exist, When the hook fetches, Then it returns the return list", async () => {
      const mockData = {
        data: [{ id: "r-1", type: "RETURN_CUSTOMER", status: "DRAFT" }],
        pagination: { page: 1, limit: 10, total: 1 },
      };
      mockFindAll.mockResolvedValueOnce(mockData);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useReturns(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindAll).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual(mockData);
    });

    it("Given filters, When the hook fetches, Then it passes filters to findAll", async () => {
      const filters = { type: "RETURN_SUPPLIER" };
      mockFindAll.mockResolvedValueOnce({ data: [], pagination: {} });
      const { Wrapper } = createQueryWrapper();

      renderHook(() => useReturns(filters), { wrapper: Wrapper });

      await waitFor(() => expect(mockFindAll).toHaveBeenCalledWith(filters));
    });
  });

  // ── useReturn ──────────────────────────────────────────────────────

  describe("useReturn", () => {
    it("Given a valid id, When the hook fetches, Then it returns the return detail", async () => {
      const returnItem = {
        id: "r-1",
        type: "RETURN_CUSTOMER",
        status: "DRAFT",
        lines: [],
      };
      mockFindById.mockResolvedValueOnce(returnItem);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useReturn("r-1"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindById).toHaveBeenCalledWith("r-1");
      expect(result.current.data).toEqual(returnItem);
    });

    it("Given an empty id, When the hook renders, Then it does not fetch", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useReturn(""), {
        wrapper: Wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockFindById).not.toHaveBeenCalled();
    });
  });

  // ── useCreateReturn ────────────────────────────────────────────────

  describe("useCreateReturn", () => {
    it("Given valid data, When mutate is called, Then it creates the return and shows success toast", async () => {
      mockCreate.mockResolvedValueOnce({ id: "r-2" });
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCreateReturn(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          type: "RETURN_CUSTOMER",
          saleId: "s-1",
        });
      });

      expect(mockCreate).toHaveBeenCalledWith({
        type: "RETURN_CUSTOMER",
        saleId: "s-1",
      });
      expect(toast.success).toHaveBeenCalledWith("messages.created");
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockCreate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCreateReturn(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            type: "RETURN_CUSTOMER",
            saleId: "s-1",
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith("toast.error");
    });
  });

  // ── useUpdateReturn ────────────────────────────────────────────────

  describe("useUpdateReturn", () => {
    it("Given valid data, When mutate is called, Then it updates and invalidates queries", async () => {
      mockUpdate.mockResolvedValueOnce({ id: "r-1" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateReturn(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "r-1",
          data: { reason: "Defective" },
        });
      });

      expect(mockUpdate).toHaveBeenCalledWith("r-1", { reason: "Defective" });
      expect(toast.success).toHaveBeenCalledWith("messages.updated");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["returns", "list"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["returns", "detail", "r-1"],
      });
    });
  });

  // ── useConfirmReturn ───────────────────────────────────────────────

  describe("useConfirmReturn", () => {
    it("Given a draft return, When confirming, Then it confirms and shows success toast", async () => {
      mockConfirm.mockResolvedValueOnce({
        id: "r-1",
        status: "CONFIRMED",
      });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useConfirmReturn(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync("r-1");
      });

      expect(mockConfirm).toHaveBeenCalledWith("r-1");
      expect(toast.success).toHaveBeenCalledWith("messages.confirmed");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["returns", "list"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["returns", "detail", "r-1"],
      });
    });

    it("Given a server error, When confirming, Then it shows error toast", async () => {
      mockConfirm.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useConfirmReturn(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync("r-1");
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith("toast.error");
    });
  });

  // ── useCancelReturn ────────────────────────────────────────────────

  describe("useCancelReturn", () => {
    it("Given a return, When cancelling, Then it cancels and shows success toast", async () => {
      mockCancel.mockResolvedValueOnce({
        id: "r-1",
        status: "CANCELLED",
      });
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCancelReturn(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync("r-1");
      });

      expect(mockCancel).toHaveBeenCalledWith("r-1");
      expect(toast.success).toHaveBeenCalledWith("messages.cancelled");
    });
  });

  // ── useAddReturnLine ───────────────────────────────────────────────

  describe("useAddReturnLine", () => {
    it("Given a return, When adding a line, Then it adds and shows success toast", async () => {
      mockAddLine.mockResolvedValueOnce({ id: "rl-1" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useAddReturnLine(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          returnId: "r-1",
          line: { productId: "p-1", quantity: 2 },
        });
      });

      expect(mockAddLine).toHaveBeenCalledWith("r-1", {
        productId: "p-1",
        quantity: 2,
      });
      expect(toast.success).toHaveBeenCalledWith("messages.lineAdded");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["returns", "detail", "r-1"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["returns", "list"],
      });
    });

    it("Given a server error, When adding a line, Then it shows error toast", async () => {
      mockAddLine.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useAddReturnLine(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            returnId: "r-1",
            line: { productId: "p-1", quantity: 1 },
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith("toast.error");
    });
  });

  // ── useRemoveReturnLine ────────────────────────────────────────────

  describe("useRemoveReturnLine", () => {
    it("Given a return with lines, When removing a line, Then it removes and shows success toast", async () => {
      mockRemoveLine.mockResolvedValueOnce(undefined);
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useRemoveReturnLine(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          returnId: "r-1",
          lineId: "rl-1",
        });
      });

      expect(mockRemoveLine).toHaveBeenCalledWith("r-1", "rl-1");
      expect(toast.success).toHaveBeenCalledWith("messages.lineRemoved");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["returns", "detail", "r-1"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["returns", "list"],
      });
    });

    it("Given a server error, When removing a line, Then it shows error toast", async () => {
      mockRemoveLine.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useRemoveReturnLine(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            returnId: "r-1",
            lineId: "rl-1",
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith("toast.error");
    });
  });
});
