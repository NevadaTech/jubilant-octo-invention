import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePickingConfig } from "@/modules/sales/presentation/hooks/use-picking-config";

vi.mock(
  "@/modules/authentication/infrastructure/services/token.service",
  () => ({
    TokenService: {
      getOrganizationSlug: () => "test-org",
    },
  }),
);

describe("usePickingConfig", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns default config (OFF) when no stored value", () => {
    const { result } = renderHook(() => usePickingConfig());

    expect(result.current.config).toEqual({ mode: "OFF" });
  });

  it("persists config to localStorage", () => {
    const { result } = renderHook(() => usePickingConfig());

    act(() => {
      result.current.setConfig({ mode: "REQUIRED_FULL" });
    });

    const stored = JSON.parse(
      localStorage.getItem("nevada-picking-config-test-org")!,
    );
    expect(stored).toEqual({ mode: "REQUIRED_FULL" });
  });

  it("reads config from localStorage on mount", () => {
    localStorage.setItem(
      "nevada-picking-config-test-org",
      JSON.stringify({ mode: "OPTIONAL" }),
    );

    const { result } = renderHook(() => usePickingConfig());

    // After hydration from useEffect
    expect(result.current.config.mode).toBe("OPTIONAL");
  });
});
