import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockFindAll = vi.fn();
const mockFindById = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockChangeStatus = vi.fn();
const mockAssignRole = vi.fn();
const mockRemoveRole = vi.fn();

vi.mock("@/config/di/container", () => ({
  getContainer: vi.fn(() => ({
    userRepository: {
      findAll: mockFindAll,
      findById: mockFindById,
      create: mockCreate,
      update: mockUpdate,
      changeStatus: mockChangeStatus,
      assignRole: mockAssignRole,
      removeRole: mockRemoveRole,
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
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useChangeUserStatus,
  useAssignRole,
  useRemoveRole,
} from "@/modules/users/presentation/hooks/use-users";
import { toast } from "sonner";

describe("use-users hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── useUsers ───────────────────────────────────────────────────────

  describe("useUsers", () => {
    it("Given users exist, When the hook fetches, Then it returns the user list", async () => {
      const mockData = {
        data: [{ id: "u-1", email: "user@example.com", status: "ACTIVE" }],
        pagination: { page: 1, limit: 10, total: 1 },
      };
      mockFindAll.mockResolvedValueOnce(mockData);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useUsers(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindAll).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual(mockData);
    });

    it("Given filters, When the hook fetches, Then it passes filters to findAll", async () => {
      const filters = { status: "ACTIVE", search: "john" };
      mockFindAll.mockResolvedValueOnce({ data: [], pagination: {} });
      const { Wrapper } = createQueryWrapper();

      renderHook(() => useUsers(filters), { wrapper: Wrapper });

      await waitFor(() => expect(mockFindAll).toHaveBeenCalledWith(filters));
    });
  });

  // ── useUser ────────────────────────────────────────────────────────

  describe("useUser", () => {
    it("Given a valid id, When the hook fetches, Then it returns the user", async () => {
      const user = { id: "u-1", email: "user@example.com" };
      mockFindById.mockResolvedValueOnce(user);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useUser("u-1"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindById).toHaveBeenCalledWith("u-1");
      expect(result.current.data).toEqual(user);
    });

    it("Given an empty id, When the hook renders, Then it does not fetch", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useUser(""), { wrapper: Wrapper });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockFindById).not.toHaveBeenCalled();
    });
  });

  // ── useCreateUser ──────────────────────────────────────────────────

  describe("useCreateUser", () => {
    it("Given valid data, When mutate is called, Then it creates the user and shows success toast", async () => {
      mockCreate.mockResolvedValueOnce({ id: "u-2" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreateUser(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          email: "new@example.com",
          firstName: "New",
          lastName: "User",
          password: "pass123",
        });
      });

      expect(mockCreate).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("messages.created");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["users", "list"],
      });
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockCreate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCreateUser(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            email: "fail@example.com",
            firstName: "F",
            lastName: "U",
            password: "p",
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith("toast.error");
    });
  });

  // ── useUpdateUser ──────────────────────────────────────────────────

  describe("useUpdateUser", () => {
    it("Given valid data, When mutate is called, Then it updates and invalidates queries", async () => {
      mockUpdate.mockResolvedValueOnce({ id: "u-1" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateUser(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "u-1",
          data: { firstName: "Updated" },
        });
      });

      expect(mockUpdate).toHaveBeenCalledWith("u-1", { firstName: "Updated" });
      expect(toast.success).toHaveBeenCalledWith("messages.updated");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["users", "list"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["users", "detail", "u-1"],
      });
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockUpdate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useUpdateUser(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            id: "u-1",
            data: { firstName: "Fail" },
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith("toast.error");
    });
  });

  // ── useChangeUserStatus ────────────────────────────────────────────

  describe("useChangeUserStatus", () => {
    it("Given a user, When changing status, Then it changes and shows success toast", async () => {
      mockChangeStatus.mockResolvedValueOnce({
        id: "u-1",
        status: "INACTIVE",
      });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useChangeUserStatus(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "u-1",
          data: { status: "INACTIVE" },
        });
      });

      expect(mockChangeStatus).toHaveBeenCalledWith("u-1", {
        status: "INACTIVE",
      });
      expect(toast.success).toHaveBeenCalledWith("messages.statusChanged");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["users", "list"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["users", "detail", "u-1"],
      });
    });

    it("Given a server error, When changing status, Then it shows error toast", async () => {
      mockChangeStatus.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useChangeUserStatus(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            id: "u-1",
            data: { status: "LOCKED" },
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith("toast.error");
    });
  });

  // ── useAssignRole ──────────────────────────────────────────────────

  describe("useAssignRole", () => {
    it("Given a user, When assigning a role, Then it assigns and shows success toast", async () => {
      mockAssignRole.mockResolvedValueOnce(undefined);
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useAssignRole(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          userId: "u-1",
          data: { roleId: "role-1" },
        });
      });

      expect(mockAssignRole).toHaveBeenCalledWith("u-1", { roleId: "role-1" });
      expect(toast.success).toHaveBeenCalledWith("roles.assignSuccess");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["users", "detail", "u-1"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["users", "list"],
      });
    });

    it("Given a server error, When assigning a role, Then it shows error toast", async () => {
      mockAssignRole.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useAssignRole(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            userId: "u-1",
            data: { roleId: "role-1" },
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith("roles.assignError");
    });
  });

  // ── useRemoveRole ──────────────────────────────────────────────────

  describe("useRemoveRole", () => {
    it("Given a user with a role, When removing the role, Then it removes and shows success toast", async () => {
      mockRemoveRole.mockResolvedValueOnce(undefined);
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useRemoveRole(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          userId: "u-1",
          roleId: "role-1",
        });
      });

      expect(mockRemoveRole).toHaveBeenCalledWith("u-1", "role-1");
      expect(toast.success).toHaveBeenCalledWith("roles.removeSuccess");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["users", "detail", "u-1"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["users", "list"],
      });
    });

    it("Given a server error, When removing a role, Then it shows error toast", async () => {
      mockRemoveRole.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useRemoveRole(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            userId: "u-1",
            roleId: "role-1",
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith("roles.removeError");
    });
  });
});
