import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePickingConfig } from "@/modules/sales/presentation/hooks/use-picking-config";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockGetPickingConfig = vi.fn();
const mockUpdatePickingConfig = vi.fn();

vi.mock("@/config/di/container", () => ({
  getContainer: () => ({
    settingsRepository: {
      getPickingConfig: mockGetPickingConfig,
      updatePickingConfig: mockUpdatePickingConfig,
    },
  }),
}));

describe("usePickingConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns default config (OFF) while loading", () => {
    mockGetPickingConfig.mockResolvedValue({
      pickingMode: "OFF",
      pickingEnabled: false,
    });

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => usePickingConfig(), {
      wrapper: Wrapper,
    });

    expect(result.current.config).toEqual({ mode: "OFF" });
    expect(result.current.isLoading).toBe(true);
  });

  it("fetches config from API", async () => {
    mockGetPickingConfig.mockResolvedValue({
      pickingMode: "REQUIRED_FULL",
      pickingEnabled: true,
    });

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => usePickingConfig(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.config).toEqual({ mode: "REQUIRED_FULL" });
    expect(mockGetPickingConfig).toHaveBeenCalledOnce();
  });

  it("calls API when setting config", async () => {
    mockGetPickingConfig.mockResolvedValue({
      pickingMode: "OFF",
      pickingEnabled: false,
    });
    mockUpdatePickingConfig.mockResolvedValue({
      pickingMode: "OPTIONAL",
      pickingEnabled: true,
    });

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => usePickingConfig(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.setConfig({ mode: "OPTIONAL" });

    await waitFor(() => {
      expect(mockUpdatePickingConfig).toHaveBeenCalledWith({
        pickingMode: "OPTIONAL",
      });
    });
  });

  it("calls API when toggling pickingEnabled", async () => {
    mockGetPickingConfig.mockResolvedValue({
      pickingMode: "OFF",
      pickingEnabled: false,
    });
    mockUpdatePickingConfig.mockResolvedValue({
      pickingMode: "OFF",
      pickingEnabled: true,
    });

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => usePickingConfig(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.setPickingEnabled(true);

    await waitFor(() => {
      expect(mockUpdatePickingConfig).toHaveBeenCalledWith({
        pickingEnabled: true,
      });
    });
  });
});
