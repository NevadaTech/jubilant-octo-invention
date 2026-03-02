import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockFindAll = vi.fn();
const mockFindById = vi.fn();
const mockGetPermissions = vi.fn();
const mockGetRolePermissions = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockAssignPermissions = vi.fn();

vi.mock("@/config/di/container", () => ({
  getContainer: vi.fn(() => ({
    roleRepository: {
      findAll: mockFindAll,
      findById: mockFindById,
      getPermissions: mockGetPermissions,
      getRolePermissions: mockGetRolePermissions,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
      assignPermissions: mockAssignPermissions,
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
  useRoles,
  useRole,
  usePermissions,
  useRolePermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useAssignPermissions,
} from "@/modules/roles/presentation/hooks/use-roles";
import { toast } from "sonner";

describe("use-roles hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── useRoles ───────────────────────────────────────────────────────

  describe("useRoles", () => {
    it("Given roles exist, When the hook fetches, Then it returns the role list", async () => {
      const mockData = [
        { id: "role-1", name: "Admin", type: "SYSTEM" },
        { id: "role-2", name: "Editor", type: "CUSTOM" },
      ];
      mockFindAll.mockResolvedValueOnce(mockData);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useRoles(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindAll).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockData);
    });
  });

  // ── useRole ────────────────────────────────────────────────────────

  describe("useRole", () => {
    it("Given a valid id, When the hook fetches, Then it returns the role", async () => {
      const role = { id: "role-1", name: "Admin", type: "SYSTEM" };
      mockFindById.mockResolvedValueOnce(role);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useRole("role-1"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindById).toHaveBeenCalledWith("role-1");
      expect(result.current.data).toEqual(role);
    });

    it("Given an empty id, When the hook renders, Then it does not fetch", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useRole(""), { wrapper: Wrapper });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockFindById).not.toHaveBeenCalled();
    });
  });

  // ── usePermissions ─────────────────────────────────────────────────

  describe("usePermissions", () => {
    it("Given permissions exist, When the hook fetches, Then it returns all permissions", async () => {
      const permissions = [
        { code: "USERS:CREATE", module: "USERS", action: "CREATE" },
        { code: "USERS:READ", module: "USERS", action: "READ" },
      ];
      mockGetPermissions.mockResolvedValueOnce(permissions);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => usePermissions(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockGetPermissions).toHaveBeenCalled();
      expect(result.current.data).toEqual(permissions);
    });
  });

  // ── useRolePermissions ─────────────────────────────────────────────

  describe("useRolePermissions", () => {
    it("Given a role with permissions, When the hook fetches, Then it returns role permissions", async () => {
      const rolePerms = ["USERS:CREATE", "USERS:READ"];
      mockGetRolePermissions.mockResolvedValueOnce(rolePerms);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useRolePermissions("role-1"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockGetRolePermissions).toHaveBeenCalledWith("role-1");
      expect(result.current.data).toEqual(rolePerms);
    });

    it("Given an empty roleId, When the hook renders, Then it does not fetch", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useRolePermissions(""), {
        wrapper: Wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockGetRolePermissions).not.toHaveBeenCalled();
    });

    it("Given enabled=false, When the hook renders, Then it does not fetch", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useRolePermissions("role-1", false), {
        wrapper: Wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockGetRolePermissions).not.toHaveBeenCalled();
    });
  });

  // ── useCreateRole ──────────────────────────────────────────────────

  describe("useCreateRole", () => {
    it("Given valid data, When mutate is called, Then it creates the role and shows success toast", async () => {
      mockCreate.mockResolvedValueOnce({ id: "role-3" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreateRole(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          name: "Viewer",
          description: "Read-only",
        });
      });

      expect(mockCreate).toHaveBeenCalledWith({
        name: "Viewer",
        description: "Read-only",
      });
      expect(toast.success).toHaveBeenCalledWith("messages.created");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["roles", "list"],
      });
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockCreate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCreateRole(), {
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

  // ── useUpdateRole ──────────────────────────────────────────────────

  describe("useUpdateRole", () => {
    it("Given valid data, When mutate is called, Then it updates and invalidates all role queries", async () => {
      mockUpdate.mockResolvedValueOnce({ id: "role-1" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateRole(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "role-1",
          data: { name: "Updated Admin" },
        });
      });

      expect(mockUpdate).toHaveBeenCalledWith("role-1", {
        name: "Updated Admin",
      });
      expect(toast.success).toHaveBeenCalledWith("messages.updated");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["roles"],
      });
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockUpdate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useUpdateRole(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            id: "role-1",
            data: { name: "Fail" },
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith("toast.error");
    });
  });

  // ── useDeleteRole ──────────────────────────────────────────────────

  describe("useDeleteRole", () => {
    it("Given a valid id, When mutate is called, Then it deletes and shows success toast", async () => {
      mockDelete.mockResolvedValueOnce(undefined);
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useDeleteRole(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync("role-2");
      });

      expect(mockDelete).toHaveBeenCalledWith("role-2");
      expect(toast.success).toHaveBeenCalledWith("messages.deleted");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["roles", "list"],
      });
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockDelete.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useDeleteRole(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync("role-2");
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith("toast.error");
    });
  });

  // ── useAssignPermissions ───────────────────────────────────────────

  describe("useAssignPermissions", () => {
    it("Given a role, When assigning permissions, Then it assigns and shows success toast", async () => {
      mockAssignPermissions.mockResolvedValueOnce(undefined);
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useAssignPermissions(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "role-1",
          data: { permissions: ["USERS:CREATE", "USERS:READ"] },
        });
      });

      expect(mockAssignPermissions).toHaveBeenCalledWith("role-1", {
        permissions: ["USERS:CREATE", "USERS:READ"],
      });
      expect(toast.success).toHaveBeenCalledWith("messages.permissionsUpdated");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["roles"],
      });
    });

    it("Given a server error, When assigning permissions, Then it shows error toast", async () => {
      mockAssignPermissions.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useAssignPermissions(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            id: "role-1",
            data: { permissions: [] },
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith("toast.error");
    });
  });
});
