import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockFindAll = vi.fn();
const mockFindById = vi.fn();

vi.mock("@/config/di/container", () => ({
  getContainer: vi.fn(() => ({
    auditLogRepository: {
      findAll: mockFindAll,
      findById: mockFindById,
    },
  })),
}));

import {
  useAuditLogs,
  useAuditLog,
} from "@/modules/audit/presentation/hooks/use-audit-logs";

describe("use-audit-logs hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── useAuditLogs ───────────────────────────────────────────────────

  describe("useAuditLogs", () => {
    it("Given audit logs exist, When the hook fetches, Then it returns the audit log list", async () => {
      const mockData = {
        data: [
          {
            id: "al-1",
            entityType: "PRODUCT",
            action: "CREATE",
            httpMethod: "POST",
            performedBy: "u-1",
          },
        ],
        pagination: { page: 1, limit: 10, total: 1 },
      };
      mockFindAll.mockResolvedValueOnce(mockData);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useAuditLogs(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindAll).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual(mockData);
    });

    it("Given filters, When the hook fetches, Then it passes filters to findAll", async () => {
      const filters = {
        entityType: "SALE",
        action: "UPDATE",
        httpMethod: "PATCH",
        page: 1,
        limit: 20,
      };
      mockFindAll.mockResolvedValueOnce({ data: [], pagination: {} });
      const { Wrapper } = createQueryWrapper();

      renderHook(() => useAuditLogs(filters), { wrapper: Wrapper });

      await waitFor(() => expect(mockFindAll).toHaveBeenCalledWith(filters));
    });

    it("Given date range filters, When the hook fetches, Then it includes date parameters", async () => {
      const filters = {
        startDate: "2026-01-01",
        endDate: "2026-01-31",
      };
      mockFindAll.mockResolvedValueOnce({ data: [], pagination: {} });
      const { Wrapper } = createQueryWrapper();

      renderHook(() => useAuditLogs(filters), { wrapper: Wrapper });

      await waitFor(() => expect(mockFindAll).toHaveBeenCalledWith(filters));
    });

    it("Given a server error, When the hook fetches, Then it reports the error", async () => {
      mockFindAll.mockRejectedValueOnce(new Error("Forbidden"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useAuditLogs(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  // ── useAuditLog ────────────────────────────────────────────────────

  describe("useAuditLog", () => {
    it("Given a valid id, When the hook fetches, Then it returns the audit log detail", async () => {
      const auditLog = {
        id: "al-1",
        entityType: "PRODUCT",
        entityId: "p-1",
        action: "CREATE",
        httpMethod: "POST",
        performedBy: "u-1",
        changes: { name: { from: null, to: "Widget" } },
        createdAt: "2026-01-15T10:00:00Z",
      };
      mockFindById.mockResolvedValueOnce(auditLog);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useAuditLog("al-1"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindById).toHaveBeenCalledWith("al-1");
      expect(result.current.data).toEqual(auditLog);
    });

    it("Given an empty id, When the hook renders, Then it does not fetch", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useAuditLog(""), {
        wrapper: Wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockFindById).not.toHaveBeenCalled();
    });

    it("Given a server error, When the hook fetches, Then it reports the error", async () => {
      mockFindById.mockRejectedValueOnce(new Error("Not found"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useAuditLog("al-999"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });
});
