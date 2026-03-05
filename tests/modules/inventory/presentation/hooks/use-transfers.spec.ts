import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockFindAll = vi.fn();
const mockFindById = vi.fn();
const mockCreate = vi.fn();
const mockUpdateStatus = vi.fn();
const mockReceive = vi.fn();

vi.mock("@/config/di/container", () => ({
  getContainer: vi.fn(() => ({
    transferRepository: {
      findAll: mockFindAll,
      findById: mockFindById,
      create: mockCreate,
      updateStatus: mockUpdateStatus,
      receive: mockReceive,
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
  useTransfers,
  useTransfer,
  useCreateTransfer,
  useUpdateTransferStatus,
  useReceiveTransfer,
  transferKeys,
} from "@/modules/inventory/presentation/hooks/use-transfers";
import { toast } from "sonner";

describe("use-transfers hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Query Key Factory ──────────────────────────────────────────────

  describe("transferKeys", () => {
    it("Given the key factory, When calling all, Then it returns the base key", () => {
      expect(transferKeys.all).toEqual(["transfers"]);
    });

    it("Given the key factory, When calling lists(), Then it returns the list key", () => {
      expect(transferKeys.lists()).toEqual(["transfers", "list"]);
    });

    it("Given filters, When calling list(filters), Then it appends filters", () => {
      const filters = { status: "PENDING" };
      expect(transferKeys.list(filters)).toEqual([
        "transfers",
        "list",
        filters,
      ]);
    });

    it("Given an id, When calling detail(id), Then it returns the detail key", () => {
      expect(transferKeys.detail("t-1")).toEqual([
        "transfers",
        "detail",
        "t-1",
      ]);
    });
  });

  // ── useTransfers ───────────────────────────────────────────────────

  describe("useTransfers", () => {
    it("Given transfers exist, When the hook fetches, Then it returns the transfer list", async () => {
      const mockData = {
        data: [{ id: "t-1", status: "PENDING" }],
        pagination: { page: 1, limit: 10, total: 1 },
      };
      mockFindAll.mockResolvedValueOnce(mockData);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useTransfers(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindAll).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual(mockData);
    });

    it("Given filters, When the hook fetches, Then it passes filters to findAll", async () => {
      const filters = { status: "COMPLETED" };
      mockFindAll.mockResolvedValueOnce({ data: [], pagination: {} });
      const { Wrapper } = createQueryWrapper();

      renderHook(() => useTransfers(filters), { wrapper: Wrapper });

      await waitFor(() => expect(mockFindAll).toHaveBeenCalledWith(filters));
    });
  });

  // ── useTransfer ────────────────────────────────────────────────────

  describe("useTransfer", () => {
    it("Given a valid id, When the hook fetches, Then it returns the transfer", async () => {
      const transfer = { id: "t-1", status: "PENDING" };
      mockFindById.mockResolvedValueOnce(transfer);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useTransfer("t-1"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindById).toHaveBeenCalledWith("t-1");
      expect(result.current.data).toEqual(transfer);
    });

    it("Given an empty id, When the hook renders, Then it does not fetch", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useTransfer(""), {
        wrapper: Wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockFindById).not.toHaveBeenCalled();
    });
  });

  // ── useCreateTransfer ──────────────────────────────────────────────

  describe("useCreateTransfer", () => {
    it("Given valid data, When mutate is called, Then it creates the transfer and invalidates transfer + stock queries", async () => {
      mockCreate.mockResolvedValueOnce({ id: "t-2" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreateTransfer(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          fromWarehouseId: "w-1",
          toWarehouseId: "w-2",
          lines: [],
        });
      });

      expect(mockCreate).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("messages.created");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: transferKeys.lists(),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["stock", "list"],
      });
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockCreate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCreateTransfer(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            fromWarehouseId: "w-1",
            toWarehouseId: "w-2",
            lines: [],
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ── useUpdateTransferStatus ────────────────────────────────────────

  describe("useUpdateTransferStatus", () => {
    it("Given a transfer, When updating status, Then it updates and invalidates transfer + stock queries", async () => {
      mockUpdateStatus.mockResolvedValueOnce({
        id: "t-1",
        status: "IN_TRANSIT",
      });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateTransferStatus(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "t-1",
          status: "IN_TRANSIT" as any,
        });
      });

      expect(mockUpdateStatus).toHaveBeenCalledWith("t-1", "IN_TRANSIT");
      expect(toast.success).toHaveBeenCalledWith("messages.updated");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: transferKeys.lists(),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: transferKeys.detail("t-1"),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["stock", "list"],
      });
    });

    it("Given a server error, When updating status, Then it shows error toast", async () => {
      mockUpdateStatus.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useUpdateTransferStatus(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            id: "t-1",
            status: "CANCELLED" as any,
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ── useReceiveTransfer ─────────────────────────────────────────────

  describe("useReceiveTransfer", () => {
    it("Given a transfer in transit, When receiving, Then it receives and invalidates transfer + stock queries", async () => {
      mockReceive.mockResolvedValueOnce({
        id: "t-1",
        status: "COMPLETED",
      });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useReceiveTransfer(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "t-1",
          data: { receivedLines: [] },
        });
      });

      expect(mockReceive).toHaveBeenCalledWith("t-1", { receivedLines: [] });
      expect(toast.success).toHaveBeenCalledWith("messages.received");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: transferKeys.lists(),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: transferKeys.detail("t-1"),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["stock", "list"],
      });
    });

    it("Given a server error, When receiving, Then it shows error toast", async () => {
      mockReceive.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useReceiveTransfer(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            id: "t-1",
            data: { receivedLines: [] },
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });
});
