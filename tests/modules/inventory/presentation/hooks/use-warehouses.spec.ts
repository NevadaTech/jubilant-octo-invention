import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockFindAll = vi.fn();
const mockFindById = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/config/di/container", () => ({
  getContainer: vi.fn(() => ({
    warehouseRepository: {
      findAll: mockFindAll,
      findById: mockFindById,
      create: mockCreate,
      update: mockUpdate,
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
  useWarehouses,
  useWarehouse,
  useCreateWarehouse,
  useUpdateWarehouse,
  useToggleWarehouseStatus,
  warehouseKeys,
} from "@/modules/inventory/presentation/hooks/use-warehouses";
import { toast } from "sonner";

describe("use-warehouses hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Query Key Factory ──────────────────────────────────────────────

  describe("warehouseKeys", () => {
    it("Given the key factory, When calling all, Then it returns the base key", () => {
      expect(warehouseKeys.all).toEqual(["warehouses"]);
    });

    it("Given the key factory, When calling lists(), Then it returns the list key", () => {
      expect(warehouseKeys.lists()).toEqual(["warehouses", "list"]);
    });

    it("Given filters, When calling list(filters), Then it appends filters", () => {
      const filters = { isActive: true };
      expect(warehouseKeys.list(filters)).toEqual([
        "warehouses",
        "list",
        filters,
      ]);
    });

    it("Given an id, When calling detail(id), Then it returns the detail key", () => {
      expect(warehouseKeys.detail("w-1")).toEqual([
        "warehouses",
        "detail",
        "w-1",
      ]);
    });
  });

  // ── useWarehouses ──────────────────────────────────────────────────

  describe("useWarehouses", () => {
    it("Given warehouses exist, When the hook fetches, Then it returns the warehouse list", async () => {
      const mockData = {
        data: [{ id: "w-1", name: "Main Warehouse" }],
        pagination: { page: 1, limit: 10, total: 1 },
      };
      mockFindAll.mockResolvedValueOnce(mockData);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useWarehouses(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindAll).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual(mockData);
    });
  });

  // ── useWarehouse ───────────────────────────────────────────────────

  describe("useWarehouse", () => {
    it("Given a valid id, When the hook fetches, Then it returns the warehouse", async () => {
      const warehouse = { id: "w-1", name: "Main Warehouse" };
      mockFindById.mockResolvedValueOnce(warehouse);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useWarehouse("w-1"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindById).toHaveBeenCalledWith("w-1");
      expect(result.current.data).toEqual(warehouse);
    });

    it("Given an empty id, When the hook renders, Then it does not fetch", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useWarehouse(""), {
        wrapper: Wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockFindById).not.toHaveBeenCalled();
    });
  });

  // ── useCreateWarehouse ─────────────────────────────────────────────

  describe("useCreateWarehouse", () => {
    it("Given valid data, When mutate is called, Then it creates the warehouse and shows success toast", async () => {
      mockCreate.mockResolvedValueOnce({ id: "w-2", name: "Secondary" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreateWarehouse(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ name: "Secondary" });
      });

      expect(mockCreate).toHaveBeenCalledWith({ name: "Secondary" });
      expect(toast.success).toHaveBeenCalledWith("messages.created");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: warehouseKeys.lists(),
      });
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockCreate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCreateWarehouse(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ name: "Fail" });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith("toast.error");
    });
  });

  // ── useUpdateWarehouse ─────────────────────────────────────────────

  describe("useUpdateWarehouse", () => {
    it("Given valid data, When mutate is called, Then it updates and invalidates both queries", async () => {
      mockUpdate.mockResolvedValueOnce({ id: "w-1", name: "Renamed" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateWarehouse(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "w-1",
          data: { name: "Renamed" },
        });
      });

      expect(mockUpdate).toHaveBeenCalledWith("w-1", { name: "Renamed" });
      expect(toast.success).toHaveBeenCalledWith("messages.updated");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: warehouseKeys.lists(),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: warehouseKeys.detail("w-1"),
      });
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockUpdate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useUpdateWarehouse(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            id: "w-1",
            data: { name: "Fail" },
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith("toast.error");
    });
  });

  // ── useToggleWarehouseStatus ───────────────────────────────────────

  describe("useToggleWarehouseStatus", () => {
    it("Given a warehouse, When toggling status, Then it calls update with isActive and invalidates queries", async () => {
      mockUpdate.mockResolvedValueOnce({ id: "w-1", isActive: false });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useToggleWarehouseStatus(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ id: "w-1", isActive: false });
      });

      expect(mockUpdate).toHaveBeenCalledWith("w-1", { isActive: false });
      expect(toast.success).toHaveBeenCalledWith("messages.updated");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: warehouseKeys.lists(),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: warehouseKeys.detail("w-1"),
      });
    });

    it("Given a server error, When toggling, Then it shows error toast", async () => {
      mockUpdate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useToggleWarehouseStatus(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ id: "w-1", isActive: true });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith("toast.error");
    });
  });
});
