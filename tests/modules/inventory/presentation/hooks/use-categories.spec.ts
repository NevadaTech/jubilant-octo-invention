import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockFindAll = vi.fn();
const mockFindById = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/config/di/container", () => ({
  getContainer: vi.fn(() => ({
    categoryRepository: {
      findAll: mockFindAll,
      findById: mockFindById,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
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
  useCategories,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  categoryKeys,
} from "@/modules/inventory/presentation/hooks/use-categories";
import { toast } from "sonner";

describe("use-categories hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Query Key Factory ──────────────────────────────────────────────

  describe("categoryKeys", () => {
    it("Given the key factory, When calling all, Then it returns the base key", () => {
      expect(categoryKeys.all).toEqual(["categories"]);
    });

    it("Given the key factory, When calling lists(), Then it returns the list key", () => {
      expect(categoryKeys.lists()).toEqual(["categories", "list"]);
    });

    it("Given filters, When calling list(filters), Then it appends filters to the key", () => {
      const filters = { name: "Electronics" };
      expect(categoryKeys.list(filters)).toEqual([
        "categories",
        "list",
        filters,
      ]);
    });

    it("Given an id, When calling detail(id), Then it returns the detail key", () => {
      expect(categoryKeys.detail("cat-1")).toEqual([
        "categories",
        "detail",
        "cat-1",
      ]);
    });
  });

  // ── useCategories ──────────────────────────────────────────────────

  describe("useCategories", () => {
    it("Given a categories list, When the hook fetches, Then it calls findAll and returns data", async () => {
      const mockData = {
        data: [{ id: "cat-1", name: "Electronics" }],
        pagination: { page: 1, limit: 10, total: 1 },
      };
      mockFindAll.mockResolvedValueOnce(mockData);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCategories(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockFindAll).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual(mockData);
    });

    it("Given filters, When the hook fetches, Then it passes filters to findAll", async () => {
      const filters = { name: "Food" };
      mockFindAll.mockResolvedValueOnce({ data: [], pagination: {} });
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCategories(filters), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockFindAll).toHaveBeenCalledWith(filters);
    });
  });

  // ── useCategory ────────────────────────────────────────────────────

  describe("useCategory", () => {
    it("Given a valid id, When the hook fetches, Then it calls findById and returns the category", async () => {
      const mockCategory = { id: "cat-1", name: "Electronics" };
      mockFindById.mockResolvedValueOnce(mockCategory);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCategory("cat-1"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockFindById).toHaveBeenCalledWith("cat-1");
      expect(result.current.data).toEqual(mockCategory);
    });

    it("Given an empty id, When the hook renders, Then it does not fetch", async () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCategory(""), {
        wrapper: Wrapper,
      });

      // Query should not be fetching since enabled is false
      expect(result.current.fetchStatus).toBe("idle");
      expect(mockFindById).not.toHaveBeenCalled();
    });
  });

  // ── useCreateCategory ──────────────────────────────────────────────

  describe("useCreateCategory", () => {
    it("Given valid data, When mutate is called, Then it creates the category and shows success toast", async () => {
      const newCategory = { id: "cat-2", name: "Books" };
      mockCreate.mockResolvedValueOnce(newCategory);
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreateCategory(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ name: "Books" });
      });

      expect(mockCreate).toHaveBeenCalledWith({ name: "Books" });
      expect(toast.success).toHaveBeenCalledWith("messages.created");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: categoryKeys.lists(),
      });
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockCreate.mockRejectedValueOnce(new Error("Server error"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCreateCategory(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ name: "Fail" });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ── useUpdateCategory ──────────────────────────────────────────────

  describe("useUpdateCategory", () => {
    it("Given valid data, When mutate is called, Then it updates the category and shows success toast", async () => {
      const updated = { id: "cat-1", name: "Updated" };
      mockUpdate.mockResolvedValueOnce(updated);
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateCategory(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "cat-1",
          data: { name: "Updated" },
        });
      });

      expect(mockUpdate).toHaveBeenCalledWith("cat-1", { name: "Updated" });
      expect(toast.success).toHaveBeenCalledWith("messages.updated");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: categoryKeys.lists(),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: categoryKeys.detail("cat-1"),
      });
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockUpdate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useUpdateCategory(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            id: "cat-1",
            data: { name: "Fail" },
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ── useDeleteCategory ──────────────────────────────────────────────

  describe("useDeleteCategory", () => {
    it("Given a valid id, When mutate is called, Then it deletes and shows success toast", async () => {
      mockDelete.mockResolvedValueOnce(undefined);
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useDeleteCategory(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync("cat-1");
      });

      expect(mockDelete).toHaveBeenCalledWith("cat-1");
      expect(toast.success).toHaveBeenCalledWith("messages.deleted");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: categoryKeys.lists(),
      });
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockDelete.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useDeleteCategory(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync("cat-1");
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });
});
