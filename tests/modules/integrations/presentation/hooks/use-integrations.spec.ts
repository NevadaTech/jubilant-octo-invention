import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockFindAll = vi.fn();
const mockFindById = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDeleteFn = vi.fn();
const mockTestConnection = vi.fn();
const mockTriggerSync = vi.fn();
const mockGetSyncLogs = vi.fn();
const mockGetSkuMappings = vi.fn();
const mockCreateSkuMapping = vi.fn();
const mockDeleteSkuMapping = vi.fn();
const mockGetUnmatchedSkus = vi.fn();
const mockRetrySyncLog = vi.fn();
const mockRetryAllFailed = vi.fn();

vi.mock("@/config/di/container", () => ({
  getContainer: vi.fn(() => ({
    integrationRepository: {
      findAll: mockFindAll,
      findById: mockFindById,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDeleteFn,
      testConnection: mockTestConnection,
      triggerSync: mockTriggerSync,
      getSyncLogs: mockGetSyncLogs,
      getSkuMappings: mockGetSkuMappings,
      createSkuMapping: mockCreateSkuMapping,
      deleteSkuMapping: mockDeleteSkuMapping,
      getUnmatchedSkus: mockGetUnmatchedSkus,
      retrySyncLog: mockRetrySyncLog,
      retryAllFailed: mockRetryAllFailed,
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
  useIntegrations,
  useIntegration,
  useCreateIntegration,
  useUpdateIntegration,
  useDeleteIntegration,
  useTestIntegration,
  useTriggerSync,
  useSyncLogs,
  useSkuMappings,
  useCreateSkuMapping,
  useDeleteSkuMapping,
  useUnmatchedSkus,
  useRetrySyncLog,
  useRetryAllFailed,
} from "@/modules/integrations/presentation/hooks/use-integrations";
import { toast } from "sonner";

describe("use-integrations hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useIntegrations", () => {
    it("Given: integrations exist When: hook fetches Then: returns the integration list", async () => {
      const mockData = {
        data: [{ id: "int-1", provider: "VTEX", status: "CONNECTED" }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockFindAll.mockResolvedValueOnce(mockData);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useIntegrations(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindAll).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual(mockData);
    });

    it("Given: filters When: hook fetches Then: passes filters to findAll", async () => {
      const filters = { provider: "VTEX" as const };
      mockFindAll.mockResolvedValueOnce({ data: [], pagination: {} });
      const { Wrapper } = createQueryWrapper();

      renderHook(() => useIntegrations(filters), { wrapper: Wrapper });

      await waitFor(() => expect(mockFindAll).toHaveBeenCalledWith(filters));
    });
  });

  describe("useIntegration", () => {
    it("Given: valid id When: hook fetches Then: returns the integration", async () => {
      const integration = {
        id: "int-1",
        provider: "VTEX",
        status: "CONNECTED",
      };
      mockFindById.mockResolvedValueOnce(integration);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useIntegration("int-1"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindById).toHaveBeenCalledWith("int-1");
      expect(result.current.data).toEqual(integration);
    });

    it("Given: empty id When: hook renders Then: does not fetch", () => {
      const { Wrapper } = createQueryWrapper();
      const { result } = renderHook(() => useIntegration(""), {
        wrapper: Wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockFindById).not.toHaveBeenCalled();
    });
  });

  describe("useCreateIntegration", () => {
    it("Given: valid data When: mutate Then: creates and shows success toast", async () => {
      mockCreate.mockResolvedValueOnce({ id: "int-2" });
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCreateIntegration(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          provider: "VTEX",
          accountName: "mystore",
          storeName: "mystore",
          appKey: "key-123",
          appToken: "token-456",
          syncStrategy: "POLLING",
          syncDirection: "INBOUND",
        } as never);
      });

      expect(mockCreate).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("messages.created");
    });

    it("Given: server error When: mutate Then: shows error toast", async () => {
      mockCreate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCreateIntegration(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            provider: "VTEX",
            accountName: "store",
          } as never);
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("useUpdateIntegration", () => {
    it("Given: valid data When: mutate Then: updates and invalidates lists and detail queries", async () => {
      mockUpdate.mockResolvedValueOnce({ id: "int-1" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateIntegration(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "int-1",
          data: { storeName: "updated-store" },
        });
      });

      expect(mockUpdate).toHaveBeenCalledWith("int-1", {
        storeName: "updated-store",
      });
      expect(toast.success).toHaveBeenCalledWith("messages.updated");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["integrations", "list"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["integrations", "detail", "int-1"],
      });
    });

    it("Given: server error When: mutate Then: shows error toast", async () => {
      mockUpdate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useUpdateIntegration(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            id: "int-1",
            data: { storeName: "fail" },
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("useDeleteIntegration", () => {
    it("Given: valid id When: delete Then: deletes and shows success toast", async () => {
      mockDeleteFn.mockResolvedValueOnce(undefined);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useDeleteIntegration(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync("int-1");
      });

      expect(mockDeleteFn).toHaveBeenCalledWith("int-1");
      expect(toast.success).toHaveBeenCalledWith("messages.deleted");
    });

    it("Given: server error When: delete Then: shows error toast", async () => {
      mockDeleteFn.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useDeleteIntegration(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync("int-1");
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("useTestIntegration", () => {
    it("Given: connection succeeds When: mutate Then: shows testSuccess toast", async () => {
      mockTestConnection.mockResolvedValueOnce({ success: true });
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useTestIntegration(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync("int-1");
      });

      expect(mockTestConnection).toHaveBeenCalledWith("int-1");
      expect(toast.success).toHaveBeenCalledWith("messages.testSuccess");
    });

    it("Given: connection fails logically When: mutate Then: shows testFailed toast", async () => {
      mockTestConnection.mockResolvedValueOnce({ success: false });
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useTestIntegration(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync("int-1");
      });

      expect(mockTestConnection).toHaveBeenCalledWith("int-1");
      expect(toast.error).toHaveBeenCalledWith("messages.testFailed");
    });

    it("Given: server error When: mutate Then: shows error toast", async () => {
      mockTestConnection.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useTestIntegration(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync("int-1");
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("useTriggerSync", () => {
    it("Given: valid id When: trigger Then: syncs and invalidates detail and logs", async () => {
      mockTriggerSync.mockResolvedValueOnce(undefined);
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useTriggerSync(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ id: "int-1" });
      });

      expect(mockTriggerSync).toHaveBeenCalledWith(
        "int-1",
        undefined,
        undefined,
      );
      expect(toast.success).toHaveBeenCalledWith("messages.syncStarted");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["integrations", "detail", "int-1"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["integrations", "logs", "int-1"],
      });
    });

    it("Given: server error When: trigger Then: shows error toast", async () => {
      mockTriggerSync.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useTriggerSync(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ id: "int-1" });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("useSyncLogs", () => {
    it("Given: valid id When: hook fetches Then: returns sync logs", async () => {
      const mockLogs = {
        data: [{ id: "log-1", status: "SUCCESS", direction: "INBOUND" }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockGetSyncLogs.mockResolvedValueOnce(mockLogs);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useSyncLogs("int-1"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockGetSyncLogs).toHaveBeenCalledWith("int-1", undefined);
      expect(result.current.data).toEqual(mockLogs);
    });

    it("Given: empty id When: hook renders Then: does not fetch", () => {
      const { Wrapper } = createQueryWrapper();
      const { result } = renderHook(() => useSyncLogs(""), {
        wrapper: Wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockGetSyncLogs).not.toHaveBeenCalled();
    });
  });

  describe("useSkuMappings", () => {
    it("Given: valid connectionId When: hook fetches Then: returns SKU mappings", async () => {
      const mockMappings = [
        { id: "map-1", externalSku: "VTEX-001", productId: "prod-1" },
      ];
      mockGetSkuMappings.mockResolvedValueOnce(mockMappings);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useSkuMappings("int-1"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockGetSkuMappings).toHaveBeenCalledWith("int-1");
      expect(result.current.data).toEqual(mockMappings);
    });

    it("Given: empty connectionId When: hook renders Then: does not fetch", () => {
      const { Wrapper } = createQueryWrapper();
      const { result } = renderHook(() => useSkuMappings(""), {
        wrapper: Wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockGetSkuMappings).not.toHaveBeenCalled();
    });
  });

  describe("useCreateSkuMapping", () => {
    it("Given: valid data When: mutate Then: creates and invalidates skuMappings and unmatchedSkus", async () => {
      mockCreateSkuMapping.mockResolvedValueOnce({ id: "map-2" });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreateSkuMapping("int-1"), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          externalSku: "VTEX-002",
          productId: "prod-2",
        } as never);
      });

      expect(mockCreateSkuMapping).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("skuMapping.added");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["integrations", "sku-mappings", "int-1"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["integrations", "unmatched-skus", "int-1"],
      });
    });

    it("Given: server error When: mutate Then: shows error toast", async () => {
      mockCreateSkuMapping.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useCreateSkuMapping("int-1"), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            externalSku: "VTEX-X",
            productId: "prod-X",
          } as never);
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("useDeleteSkuMapping", () => {
    it("Given: valid mappingId When: delete Then: deletes and invalidates skuMappings", async () => {
      mockDeleteSkuMapping.mockResolvedValueOnce(undefined);
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useDeleteSkuMapping("int-1"), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync("map-1");
      });

      expect(mockDeleteSkuMapping).toHaveBeenCalledWith("int-1", "map-1");
      expect(toast.success).toHaveBeenCalledWith("skuMapping.deleted");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["integrations", "sku-mappings", "int-1"],
      });
    });

    it("Given: server error When: delete Then: shows error toast", async () => {
      mockDeleteSkuMapping.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useDeleteSkuMapping("int-1"), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync("map-1");
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("useUnmatchedSkus", () => {
    it("Given: valid connectionId When: hook fetches Then: returns unmatched SKUs", async () => {
      const mockUnmatched = [
        { externalSku: "VTEX-099", externalName: "Unknown Product" },
      ];
      mockGetUnmatchedSkus.mockResolvedValueOnce(mockUnmatched);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useUnmatchedSkus("int-1"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockGetUnmatchedSkus).toHaveBeenCalledWith("int-1");
      expect(result.current.data).toEqual(mockUnmatched);
    });
  });

  describe("useRetrySyncLog", () => {
    it("Given: valid logId When: retry Then: retries and invalidates logs and detail", async () => {
      mockRetrySyncLog.mockResolvedValueOnce(undefined);
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useRetrySyncLog("int-1"), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync("log-1");
      });

      expect(mockRetrySyncLog).toHaveBeenCalledWith("int-1", "log-1");
      expect(toast.success).toHaveBeenCalledWith("failedSyncs.retrySuccess");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["integrations", "logs", "int-1"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["integrations", "detail", "int-1"],
      });
    });

    it("Given: server error When: retry Then: shows error toast", async () => {
      mockRetrySyncLog.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useRetrySyncLog("int-1"), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync("log-1");
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("useRetryAllFailed", () => {
    it("Given: valid connectionId When: retryAll Then: retries all and invalidates logs and detail", async () => {
      mockRetryAllFailed.mockResolvedValueOnce(undefined);
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useRetryAllFailed("int-1"), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync();
      });

      expect(mockRetryAllFailed).toHaveBeenCalledWith("int-1");
      expect(toast.success).toHaveBeenCalledWith("failedSyncs.retryAllSuccess");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["integrations", "logs", "int-1"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["integrations", "detail", "int-1"],
      });
    });

    it("Given: server error When: retryAll Then: shows error toast", async () => {
      mockRetryAllFailed.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useRetryAllFailed("int-1"), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync();
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });
});
