import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockFindAll = vi.fn();
const mockFindById = vi.fn();
const mockGetReturns = vi.fn();
const mockGetSwapHistory = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockConfirm = vi.fn();
const mockCancel = vi.fn();
const mockStartPicking = vi.fn();
const mockShip = vi.fn();
const mockComplete = vi.fn();
const mockAddLine = vi.fn();
const mockRemoveLine = vi.fn();
const mockSwapLine = vi.fn();

vi.mock("@/config/di/container", () => ({
  getContainer: vi.fn(() => ({
    saleRepository: {
      findAll: mockFindAll,
      findById: mockFindById,
      getReturns: mockGetReturns,
      getSwapHistory: mockGetSwapHistory,
      create: mockCreate,
      update: mockUpdate,
      confirm: mockConfirm,
      cancel: mockCancel,
      startPicking: mockStartPicking,
      ship: mockShip,
      complete: mockComplete,
      addLine: mockAddLine,
      removeLine: mockRemoveLine,
      swapLine: mockSwapLine,
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
  useSales,
  useSale,
  useSaleReturns,
  useSaleSwapHistory,
  useCreateSale,
  useUpdateSale,
  useConfirmSale,
  useCancelSale,
  useStartPicking,
  useShipSale,
  useCompleteSale,
  useAddSaleLine,
  useRemoveSaleLine,
  useSwapSaleLine,
} from "@/modules/sales/presentation/hooks/use-sales";
import { toast } from "sonner";

describe("use-sales hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── useSales ───────────────────────────────────────────────────────

  describe("useSales", () => {
    it("Given sales exist, When the hook fetches, Then it returns the sale list", async () => {
      const mockData = {
        data: [{ id: "s-1", status: "DRAFT" }],
        pagination: { page: 1, limit: 10, total: 1 },
      };
      mockFindAll.mockResolvedValueOnce(mockData);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useSales(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindAll).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual(mockData);
    });

    it("Given filters, When the hook fetches, Then it passes filters to findAll", async () => {
      const filters = { status: "CONFIRMED" };
      mockFindAll.mockResolvedValueOnce({ data: [], pagination: {} });
      const { Wrapper } = createQueryWrapper();

      renderHook(() => useSales(filters), { wrapper: Wrapper });

      await waitFor(() => expect(mockFindAll).toHaveBeenCalledWith(filters));
    });
  });

  // ── useSale ────────────────────────────────────────────────────────

  describe("useSale", () => {
    it("Given a valid id, When the hook fetches, Then it returns the sale", async () => {
      const sale = { id: "s-1", status: "DRAFT", lines: [] };
      mockFindById.mockResolvedValueOnce(sale);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useSale("s-1"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindById).toHaveBeenCalledWith("s-1");
      expect(result.current.data).toEqual(sale);
    });

    it("Given an empty id, When the hook renders, Then it does not fetch", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useSale(""), { wrapper: Wrapper });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockFindById).not.toHaveBeenCalled();
    });
  });

  // ── useSaleReturns ─────────────────────────────────────────────────

  describe("useSaleReturns", () => {
    it("Given a valid saleId, When the hook fetches, Then it returns the sale returns", async () => {
      const returns = [{ id: "r-1", saleId: "s-1" }];
      mockGetReturns.mockResolvedValueOnce(returns);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useSaleReturns("s-1"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockGetReturns).toHaveBeenCalledWith("s-1");
      expect(result.current.data).toEqual(returns);
    });

    it("Given an empty saleId, When the hook renders, Then it does not fetch", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useSaleReturns(""), {
        wrapper: Wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockGetReturns).not.toHaveBeenCalled();
    });

    it("Given enabled=false, When the hook renders, Then it does not fetch", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useSaleReturns("s-1", false), {
        wrapper: Wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockGetReturns).not.toHaveBeenCalled();
    });
  });

  // ── useCreateSale ──────────────────────────────────────────────────

  describe("useCreateSale", () => {
    it("Given valid data, When mutate is called, Then it creates the sale and shows success toast", async () => {
      mockCreate.mockResolvedValueOnce({ id: "s-2" });
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCreateSale(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ customerId: "c-1", lines: [] });
      });

      expect(mockCreate).toHaveBeenCalledWith({
        customerId: "c-1",
        lines: [],
      });
      expect(toast.success).toHaveBeenCalledWith("messages.created");
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockCreate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCreateSale(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ customerId: "c-1", lines: [] });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ── useUpdateSale ──────────────────────────────────────────────────

  describe("useUpdateSale", () => {
    it("Given valid data, When mutate is called, Then it updates and invalidates queries", async () => {
      mockUpdate.mockResolvedValueOnce({ id: "s-1" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateSale(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "s-1",
          data: { notes: "Updated" },
        });
      });

      expect(mockUpdate).toHaveBeenCalledWith("s-1", { notes: "Updated" });
      expect(toast.success).toHaveBeenCalledWith("messages.updated");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["sales", "list"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["sales", "detail", "s-1"],
      });
    });
  });

  // ── useConfirmSale ─────────────────────────────────────────────────

  describe("useConfirmSale", () => {
    it("Given a draft sale, When confirming, Then it confirms and shows success toast", async () => {
      mockConfirm.mockResolvedValueOnce({ id: "s-1", status: "CONFIRMED" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useConfirmSale(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync("s-1");
      });

      expect(mockConfirm).toHaveBeenCalledWith("s-1");
      expect(toast.success).toHaveBeenCalledWith("messages.confirmed");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["sales", "list"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["sales", "detail", "s-1"],
      });
    });

    it("Given a server error, When confirming, Then it shows error toast", async () => {
      mockConfirm.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useConfirmSale(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync("s-1");
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ── useCancelSale ──────────────────────────────────────────────────

  describe("useCancelSale", () => {
    it("Given a sale, When cancelling, Then it cancels and shows success toast", async () => {
      mockCancel.mockResolvedValueOnce({ id: "s-1", status: "CANCELLED" });
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCancelSale(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync("s-1");
      });

      expect(mockCancel).toHaveBeenCalledWith("s-1");
      expect(toast.success).toHaveBeenCalledWith("messages.cancelled");
    });
  });

  // ── useStartPicking ────────────────────────────────────────────────

  describe("useStartPicking", () => {
    it("Given a confirmed sale, When starting picking, Then it transitions and shows success toast", async () => {
      mockStartPicking.mockResolvedValueOnce({
        id: "s-1",
        status: "PICKING",
      });
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useStartPicking(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync("s-1");
      });

      expect(mockStartPicking).toHaveBeenCalledWith("s-1");
      expect(toast.success).toHaveBeenCalledWith("messages.pickingStarted");
    });
  });

  // ── useShipSale ────────────────────────────────────────────────────

  describe("useShipSale", () => {
    it("Given a picking sale, When shipping, Then it ships and shows success toast", async () => {
      mockShip.mockResolvedValueOnce({ id: "s-1", status: "SHIPPED" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useShipSale(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "s-1",
          data: { trackingNumber: "TRK-001", carrier: "FedEx" },
        });
      });

      expect(mockShip).toHaveBeenCalledWith("s-1", {
        trackingNumber: "TRK-001",
        carrier: "FedEx",
      });
      expect(toast.success).toHaveBeenCalledWith("messages.shipped");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["sales", "list"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["sales", "detail", "s-1"],
      });
    });
  });

  // ── useCompleteSale ────────────────────────────────────────────────

  describe("useCompleteSale", () => {
    it("Given a shipped sale, When completing, Then it completes and shows success toast", async () => {
      mockComplete.mockResolvedValueOnce({
        id: "s-1",
        status: "COMPLETED",
      });
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCompleteSale(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync("s-1");
      });

      expect(mockComplete).toHaveBeenCalledWith("s-1");
      expect(toast.success).toHaveBeenCalledWith("messages.completed");
    });
  });

  // ── useAddSaleLine ─────────────────────────────────────────────────

  describe("useAddSaleLine", () => {
    it("Given a sale, When adding a line, Then it adds and shows success toast", async () => {
      mockAddLine.mockResolvedValueOnce({ id: "sl-1" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useAddSaleLine(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          saleId: "s-1",
          line: { productId: "p-1", quantity: 5, unitPrice: 10 },
        });
      });

      expect(mockAddLine).toHaveBeenCalledWith("s-1", {
        productId: "p-1",
        quantity: 5,
        unitPrice: 10,
      });
      expect(toast.success).toHaveBeenCalledWith("messages.lineAdded");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["sales", "detail", "s-1"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["sales", "list"],
      });
    });

    it("Given a server error, When adding a line, Then it shows error toast", async () => {
      mockAddLine.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useAddSaleLine(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            saleId: "s-1",
            line: { productId: "p-1", quantity: 1, unitPrice: 1 },
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ── useRemoveSaleLine ──────────────────────────────────────────────

  describe("useRemoveSaleLine", () => {
    it("Given a sale with lines, When removing a line, Then it removes and shows success toast", async () => {
      mockRemoveLine.mockResolvedValueOnce(undefined);
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useRemoveSaleLine(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ saleId: "s-1", lineId: "sl-1" });
      });

      expect(mockRemoveLine).toHaveBeenCalledWith("s-1", "sl-1");
      expect(toast.success).toHaveBeenCalledWith("messages.lineRemoved");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["sales", "detail", "s-1"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["sales", "list"],
      });
    });

    it("Given a server error, When removing a line, Then it shows error toast", async () => {
      mockRemoveLine.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useRemoveSaleLine(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ saleId: "s-1", lineId: "sl-1" });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ── useSaleSwapHistory ──────────────────────────────────────────────

  describe("useSaleSwapHistory", () => {
    it("Given a valid saleId, When the hook fetches, Then it returns the swap history", async () => {
      const history = [{ id: "swap-1", saleId: "s-1" }];
      mockGetSwapHistory.mockResolvedValueOnce(history);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useSaleSwapHistory("s-1"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockGetSwapHistory).toHaveBeenCalledWith("s-1");
      expect(result.current.data).toEqual(history);
    });

    it("Given an empty saleId, When the hook renders, Then it does not fetch", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useSaleSwapHistory(""), {
        wrapper: Wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockGetSwapHistory).not.toHaveBeenCalled();
    });

    it("Given enabled=false, When the hook renders, Then it does not fetch", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useSaleSwapHistory("s-1", false), {
        wrapper: Wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockGetSwapHistory).not.toHaveBeenCalled();
    });
  });

  // ── useSwapSaleLine ─────────────────────────────────────────────────

  describe("useSwapSaleLine", () => {
    it("Given valid data, When mutate is called, Then it swaps the line and shows success toast", async () => {
      mockSwapLine.mockResolvedValueOnce({ swapId: "sw-1" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useSwapSaleLine(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          saleId: "s-1",
          data: {
            lineId: "l-1",
            replacementProductId: "p-2",
            swapQuantity: 1,
            sourceWarehouseId: "wh-1",
            pricingStrategy: "KEEP_ORIGINAL" as const,
          },
        });
      });

      expect(mockSwapLine).toHaveBeenCalledWith("s-1", {
        lineId: "l-1",
        replacementProductId: "p-2",
        swapQuantity: 1,
        sourceWarehouseId: "wh-1",
        pricingStrategy: "KEEP_ORIGINAL",
      });
      expect(toast.success).toHaveBeenCalledWith("messages.lineSwapped");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["sales", "list"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["sales", "detail", "s-1"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["sales", "swaps", "s-1"],
      });
    });

    it("Given a server error, When swapping, Then it shows error toast", async () => {
      mockSwapLine.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useSwapSaleLine(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            saleId: "s-1",
            data: {
              lineId: "l-1",
              replacementProductId: "p-2",
              swapQuantity: 1,
              sourceWarehouseId: "wh-1",
              pricingStrategy: "NEW_PRICE" as const,
              newSalePrice: 50,
            },
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ── error paths for remaining hooks ─────────────────────────────────

  describe("useCancelSale error path", () => {
    it("Given a server error, When cancelling, Then it shows error toast", async () => {
      mockCancel.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCancelSale(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync("s-1");
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("useStartPicking error path", () => {
    it("Given a server error, When starting picking, Then it shows error toast", async () => {
      mockStartPicking.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useStartPicking(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync("s-1");
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("useShipSale error path", () => {
    it("Given a server error, When shipping, Then it shows error toast", async () => {
      mockShip.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useShipSale(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ id: "s-1", data: {} });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("useCompleteSale error path", () => {
    it("Given a server error, When completing, Then it shows error toast", async () => {
      mockComplete.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCompleteSale(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync("s-1");
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("useUpdateSale error path", () => {
    it("Given a server error, When updating, Then it shows error toast", async () => {
      mockUpdate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useUpdateSale(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ id: "s-1", data: {} });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });
});
