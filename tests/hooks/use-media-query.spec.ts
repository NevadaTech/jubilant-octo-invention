import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
} from "@/hooks/use-media-query";

type ChangeHandler = (event: { matches: boolean }) => void;

function createMockMediaQueryList(initialMatches: boolean) {
  let currentHandler: ChangeHandler | null = null;
  const mql = {
    matches: initialMatches,
    media: "",
    addEventListener: vi.fn((_type: string, handler: ChangeHandler) => {
      currentHandler = handler;
    }),
    removeEventListener: vi.fn((_type: string, _handler: ChangeHandler) => {
      currentHandler = null;
    }),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
    onchange: null,
    fireChange(matches: boolean) {
      if (currentHandler) {
        currentHandler({ matches } as MediaQueryListEvent);
      }
    },
  };
  return mql;
}

describe("useMediaQuery", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    // Default: not matching
    window.matchMedia = vi.fn().mockImplementation((_query: string) => {
      return createMockMediaQueryList(false);
    });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("Given: a media query that matches When: hook mounts Then: should return true", () => {
    (window.matchMedia as ReturnType<typeof vi.fn>).mockImplementation(
      () => createMockMediaQueryList(true),
    );

    const { result } = renderHook(() => useMediaQuery("(min-width: 1024px)"));
    expect(result.current).toBe(true);
  });

  it("Given: a media query that does not match When: hook mounts Then: should return false", () => {
    (window.matchMedia as ReturnType<typeof vi.fn>).mockImplementation(
      () => createMockMediaQueryList(false),
    );

    const { result } = renderHook(() => useMediaQuery("(min-width: 1024px)"));
    expect(result.current).toBe(false);
  });

  it("Given: a mounted hook When: media query changes to match Then: should update to true", () => {
    const mql = createMockMediaQueryList(false);
    (window.matchMedia as ReturnType<typeof vi.fn>).mockImplementation(() => mql);

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);

    act(() => {
      mql.fireChange(true);
    });

    expect(result.current).toBe(true);
  });

  it("Given: a mounted hook When: unmounting Then: should remove the event listener", () => {
    const mql = createMockMediaQueryList(false);
    (window.matchMedia as ReturnType<typeof vi.fn>).mockImplementation(() => mql);

    const { unmount } = renderHook(() => useMediaQuery("(max-width: 767px)"));
    unmount();

    expect(mql.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("Given: useIsMobile When: called Then: should query max-width 767px", () => {
    const mql = createMockMediaQueryList(true);
    (window.matchMedia as ReturnType<typeof vi.fn>).mockImplementation(() => mql);

    const { result } = renderHook(() => useIsMobile());
    expect(window.matchMedia).toHaveBeenCalledWith("(max-width: 767px)");
    expect(result.current).toBe(true);
  });

  it("Given: useIsTablet When: called Then: should query tablet range", () => {
    const mql = createMockMediaQueryList(false);
    (window.matchMedia as ReturnType<typeof vi.fn>).mockImplementation(() => mql);

    renderHook(() => useIsTablet());
    expect(window.matchMedia).toHaveBeenCalledWith(
      "(min-width: 768px) and (max-width: 1023px)",
    );
  });

  it("Given: useIsDesktop When: called Then: should query min-width 1024px", () => {
    const mql = createMockMediaQueryList(true);
    (window.matchMedia as ReturnType<typeof vi.fn>).mockImplementation(() => mql);

    renderHook(() => useIsDesktop());
    expect(window.matchMedia).toHaveBeenCalledWith("(min-width: 1024px)");
  });
});
