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
    companyRepository: {
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

vi.mock("@/shared/presentation/utils/get-api-error-message", () => ({
  getApiErrorMessage: vi.fn(() => "Error message"),
}));

import {
  useCompanies,
  useCompany,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
} from "@/modules/companies/presentation/hooks/use-companies";
import { toast } from "sonner";

describe("use-companies hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useCompanies", () => {
    it("Given: companies exist When: hook fetches Then: returns the company list", async () => {
      const mockData = {
        data: [{ id: "c-1", name: "Acme", code: "ACME" }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockFindAll.mockResolvedValueOnce(mockData);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCompanies(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindAll).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual(mockData);
    });

    it("Given: filters When: hook fetches Then: passes filters to findAll", async () => {
      const filters = { search: "acme" };
      mockFindAll.mockResolvedValueOnce({ data: [], pagination: {} });
      const { Wrapper } = createQueryWrapper();

      renderHook(() => useCompanies(filters), { wrapper: Wrapper });

      await waitFor(() => expect(mockFindAll).toHaveBeenCalledWith(filters));
    });
  });

  describe("useCompany", () => {
    it("Given: valid id When: hook fetches Then: returns the company", async () => {
      const company = { id: "c-1", name: "Acme", code: "ACME" };
      mockFindById.mockResolvedValueOnce(company);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCompany("c-1"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindById).toHaveBeenCalledWith("c-1");
      expect(result.current.data).toEqual(company);
    });

    it("Given: empty id When: hook renders Then: does not fetch", () => {
      const { Wrapper } = createQueryWrapper();
      const { result } = renderHook(() => useCompany(""), {
        wrapper: Wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockFindById).not.toHaveBeenCalled();
    });
  });

  describe("useCreateCompany", () => {
    it("Given: valid data When: mutate Then: creates and shows success toast", async () => {
      mockCreate.mockResolvedValueOnce({ id: "c-2" });
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCreateCompany(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          name: "New Corp",
          code: "NEWCORP",
        });
      });

      expect(mockCreate).toHaveBeenCalledWith({
        name: "New Corp",
        code: "NEWCORP",
      });
      expect(toast.success).toHaveBeenCalledWith("messages.created");
    });

    it("Given: server error When: mutate Then: shows error toast", async () => {
      mockCreate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCreateCompany(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            name: "Fail Corp",
            code: "FAIL",
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("useUpdateCompany", () => {
    it("Given: valid data When: mutate Then: updates and invalidates queries", async () => {
      mockUpdate.mockResolvedValueOnce({ id: "c-1" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateCompany(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "c-1",
          data: { name: "Updated Corp" },
        });
      });

      expect(mockUpdate).toHaveBeenCalledWith("c-1", { name: "Updated Corp" });
      expect(toast.success).toHaveBeenCalledWith("messages.updated");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["companies", "list"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["companies", "detail", "c-1"],
      });
    });

    it("Given: server error When: mutate Then: shows error toast", async () => {
      mockUpdate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useUpdateCompany(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            id: "c-1",
            data: { name: "Fail" },
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("useDeleteCompany", () => {
    it("Given: valid id When: delete Then: deletes and shows success toast", async () => {
      mockDeleteFn.mockResolvedValueOnce(undefined);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useDeleteCompany(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync("c-1");
      });

      expect(mockDeleteFn).toHaveBeenCalledWith("c-1");
      expect(toast.success).toHaveBeenCalledWith("messages.deleted");
    });

    it("Given: server error When: delete Then: shows error toast", async () => {
      mockDeleteFn.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useDeleteCompany(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync("c-1");
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });
});
