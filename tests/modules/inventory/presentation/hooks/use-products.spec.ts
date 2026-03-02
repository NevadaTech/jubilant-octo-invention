import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockFindAll = vi.fn();
const mockFindById = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/config/di/container", () => ({
  getContainer: vi.fn(() => ({
    productRepository: {
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
  useProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useToggleProductStatus,
  productKeys,
} from "@/modules/inventory/presentation/hooks/use-products";
import { toast } from "sonner";

describe("use-products hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Query Key Factory ──────────────────────────────────────────────

  describe("productKeys", () => {
    it("Given the key factory, When calling all, Then it returns the base key", () => {
      expect(productKeys.all).toEqual(["products"]);
    });

    it("Given the key factory, When calling lists(), Then it returns the list key", () => {
      expect(productKeys.lists()).toEqual(["products", "list"]);
    });

    it("Given filters, When calling list(filters), Then it appends filters", () => {
      const filters = { status: "ACTIVE" as const };
      expect(productKeys.list(filters)).toEqual([
        "products",
        "list",
        filters,
      ]);
    });

    it("Given an id, When calling detail(id), Then it returns the detail key", () => {
      expect(productKeys.detail("p-1")).toEqual(["products", "detail", "p-1"]);
    });
  });

  // ── useProducts ────────────────────────────────────────────────────

  describe("useProducts", () => {
    it("Given products exist, When the hook fetches, Then it returns the product list", async () => {
      const mockData = {
        data: [{ id: "p-1", name: "Widget" }],
        pagination: { page: 1, limit: 10, total: 1 },
      };
      mockFindAll.mockResolvedValueOnce(mockData);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useProducts(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindAll).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual(mockData);
    });

    it("Given filters, When the hook fetches, Then it passes filters to findAll", async () => {
      const filters = { search: "widget" };
      mockFindAll.mockResolvedValueOnce({ data: [], pagination: {} });
      const { Wrapper } = createQueryWrapper();

      renderHook(() => useProducts(filters), { wrapper: Wrapper });

      await waitFor(() => expect(mockFindAll).toHaveBeenCalledWith(filters));
    });
  });

  // ── useProduct ─────────────────────────────────────────────────────

  describe("useProduct", () => {
    it("Given a valid id, When the hook fetches, Then it returns the product", async () => {
      const product = { id: "p-1", name: "Widget", sku: "W-001" };
      mockFindById.mockResolvedValueOnce(product);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useProduct("p-1"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindById).toHaveBeenCalledWith("p-1");
      expect(result.current.data).toEqual(product);
    });

    it("Given an empty id, When the hook renders, Then it does not fetch", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useProduct(""), {
        wrapper: Wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockFindById).not.toHaveBeenCalled();
    });
  });

  // ── useCreateProduct ───────────────────────────────────────────────

  describe("useCreateProduct", () => {
    it("Given valid data, When mutate is called, Then it creates the product and shows success toast", async () => {
      const created = { id: "p-2", name: "Gadget" };
      mockCreate.mockResolvedValueOnce(created);
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreateProduct(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ name: "Gadget", sku: "G-001" });
      });

      expect(mockCreate).toHaveBeenCalledWith({ name: "Gadget", sku: "G-001" });
      expect(toast.success).toHaveBeenCalledWith("messages.created");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: productKeys.lists(),
      });
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockCreate.mockRejectedValueOnce(new Error("Server error"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCreateProduct(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ name: "Fail", sku: "F-001" });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith("toast.error");
    });
  });

  // ── useUpdateProduct ───────────────────────────────────────────────

  describe("useUpdateProduct", () => {
    it("Given valid data, When mutate is called, Then it updates and invalidates both list and detail", async () => {
      mockUpdate.mockResolvedValueOnce({ id: "p-1", name: "Updated" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateProduct(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "p-1",
          data: { name: "Updated" },
        });
      });

      expect(mockUpdate).toHaveBeenCalledWith("p-1", { name: "Updated" });
      expect(toast.success).toHaveBeenCalledWith("messages.updated");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: productKeys.lists(),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: productKeys.detail("p-1"),
      });
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockUpdate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useUpdateProduct(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            id: "p-1",
            data: { name: "Fail" },
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith("toast.error");
    });
  });

  // ── useToggleProductStatus ─────────────────────────────────────────

  describe("useToggleProductStatus", () => {
    it("Given a product, When toggling status to inactive, Then it calls update with isActive=false", async () => {
      mockUpdate.mockResolvedValueOnce({ id: "p-1", isActive: false });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useToggleProductStatus(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ id: "p-1", isActive: false });
      });

      expect(mockUpdate).toHaveBeenCalledWith("p-1", { isActive: false });
      expect(toast.success).toHaveBeenCalledWith("messages.updated");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: productKeys.lists(),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: productKeys.detail("p-1"),
      });
    });

    it("Given a server error, When toggling, Then it shows error toast", async () => {
      mockUpdate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useToggleProductStatus(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ id: "p-1", isActive: true });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith("toast.error");
    });
  });
});
