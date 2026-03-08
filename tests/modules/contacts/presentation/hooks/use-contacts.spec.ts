import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockFindAll = vi.fn();
const mockFindById = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDeleteFn = vi.fn();

vi.mock("@/config/di/container", () => ({
  getContainer: vi.fn(() => ({
    contactRepository: {
      findAll: mockFindAll,
      findById: mockFindById,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDeleteFn,
    },
  })),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/shared/infrastructure/http", () => ({
  getApiErrorMessage: vi.fn(() => "Error message"),
}));

import {
  useContacts,
  useContact,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
} from "@/modules/contacts/presentation/hooks/use-contacts";
import { toast } from "sonner";

describe("use-contacts hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useContacts", () => {
    it("Given: contacts exist When: hook fetches Then: returns the contact list", async () => {
      const mockData = {
        data: [{ id: "c-1", name: "John Doe", type: "CUSTOMER" }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockFindAll.mockResolvedValueOnce(mockData);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useContacts(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindAll).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual(mockData);
    });

    it("Given: filters When: hook fetches Then: passes filters to findAll", async () => {
      const filters = { type: "CUSTOMER" as const };
      mockFindAll.mockResolvedValueOnce({ data: [], pagination: {} });
      const { Wrapper } = createQueryWrapper();

      renderHook(() => useContacts(filters), { wrapper: Wrapper });

      await waitFor(() => expect(mockFindAll).toHaveBeenCalledWith(filters));
    });
  });

  describe("useContact", () => {
    it("Given: valid id When: hook fetches Then: returns the contact", async () => {
      const contact = { id: "c-1", name: "John Doe", type: "CUSTOMER" };
      mockFindById.mockResolvedValueOnce(contact);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useContact("c-1"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindById).toHaveBeenCalledWith("c-1");
      expect(result.current.data).toEqual(contact);
    });

    it("Given: empty id When: hook renders Then: does not fetch", () => {
      const { Wrapper } = createQueryWrapper();
      const { result } = renderHook(() => useContact(""), { wrapper: Wrapper });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockFindById).not.toHaveBeenCalled();
    });
  });

  describe("useCreateContact", () => {
    it("Given: valid data When: mutate Then: creates and shows success toast", async () => {
      mockCreate.mockResolvedValueOnce({ id: "c-2" });
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCreateContact(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          name: "Jane Doe",
          identification: "87654321",
          type: "SUPPLIER",
        });
      });

      expect(mockCreate).toHaveBeenCalledWith({
        name: "Jane Doe",
        identification: "87654321",
        type: "SUPPLIER",
      });
      expect(toast.success).toHaveBeenCalledWith("messages.created");
    });

    it("Given: server error When: mutate Then: shows error toast", async () => {
      mockCreate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCreateContact(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            name: "Jane",
            identification: "111",
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("useUpdateContact", () => {
    it("Given: valid data When: mutate Then: updates and invalidates queries", async () => {
      mockUpdate.mockResolvedValueOnce({ id: "c-1" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateContact(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "c-1",
          data: { name: "Jane Doe" },
        });
      });

      expect(mockUpdate).toHaveBeenCalledWith("c-1", { name: "Jane Doe" });
      expect(toast.success).toHaveBeenCalledWith("messages.updated");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["contacts", "list"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["contacts", "detail", "c-1"],
      });
    });
  });

  describe("useDeleteContact", () => {
    it("Given: valid id When: delete Then: deletes and shows success toast", async () => {
      mockDeleteFn.mockResolvedValueOnce(undefined);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useDeleteContact(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync("c-1");
      });

      expect(mockDeleteFn).toHaveBeenCalledWith("c-1");
      expect(toast.success).toHaveBeenCalledWith("messages.deleted");
    });
  });
});
