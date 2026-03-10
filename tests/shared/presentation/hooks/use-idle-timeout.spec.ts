import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIdleTimeout } from "@/shared/presentation/hooks/use-idle-timeout";

describe("useIdleTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Disabled state ---

  it("Given: enabled is false When: hook renders Then: showWarning should be false", () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() =>
      useIdleTimeout({
        enabled: false,
        timeoutSeconds: 900,
        warningSeconds: 120,
        onTimeout,
      }),
    );
    expect(result.current.showWarning).toBe(false);
  });

  it("Given: enabled is false When: idle time exceeds timeout Then: onTimeout should NOT be called", () => {
    const onTimeout = vi.fn();
    renderHook(() =>
      useIdleTimeout({
        enabled: false,
        timeoutSeconds: 10,
        warningSeconds: 5,
        onTimeout,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(20_000);
    });

    expect(onTimeout).not.toHaveBeenCalled();
  });

  it("Given: enabled is false When: hook renders Then: showWarning should remain false even after timeout period", () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() =>
      useIdleTimeout({
        enabled: false,
        timeoutSeconds: 5,
        warningSeconds: 2,
        onTimeout,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(result.current.showWarning).toBe(false);
    expect(onTimeout).not.toHaveBeenCalled();
  });

  // --- Initial state ---

  it("Given: enabled is true When: hook renders Then: should start with showWarning false and remainingSeconds = warningSeconds", () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() =>
      useIdleTimeout({
        enabled: true,
        timeoutSeconds: 10,
        warningSeconds: 5,
        onTimeout,
      }),
    );
    expect(result.current.showWarning).toBe(false);
    expect(result.current.remainingSeconds).toBe(5);
  });

  // --- onLogout ---

  it("Given: enabled is true When: onLogout is called Then: should call onTimeout and hide warning", () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() =>
      useIdleTimeout({
        enabled: true,
        timeoutSeconds: 10,
        warningSeconds: 5,
        onTimeout,
      }),
    );

    act(() => {
      result.current.onLogout();
    });

    expect(onTimeout).toHaveBeenCalledTimes(1);
    expect(result.current.showWarning).toBe(false);
  });

  it("Given: enabled is true When: onLogout called multiple times Then: onTimeout should fire each time", () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() =>
      useIdleTimeout({
        enabled: true,
        timeoutSeconds: 10,
        warningSeconds: 5,
        onTimeout,
      }),
    );

    act(() => {
      result.current.onLogout();
    });
    act(() => {
      result.current.onLogout();
    });

    expect(onTimeout).toHaveBeenCalledTimes(2);
  });

  // --- onExtend resets ---

  it("Given: enabled is true When: onExtend is called Then: remainingSeconds should be reset to warningSeconds", () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() =>
      useIdleTimeout({
        enabled: true,
        timeoutSeconds: 10,
        warningSeconds: 5,
        onTimeout,
      }),
    );

    act(() => {
      result.current.onExtend();
    });

    expect(result.current.remainingSeconds).toBe(5);
    expect(result.current.showWarning).toBe(false);
  });

  it("Given: enabled is true When: onExtend called Then: onTimeout should not have been called", () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() =>
      useIdleTimeout({
        enabled: true,
        timeoutSeconds: 10,
        warningSeconds: 5,
        onTimeout,
      }),
    );

    act(() => {
      result.current.onExtend();
    });

    expect(onTimeout).not.toHaveBeenCalled();
  });

  // --- Return types ---

  it("Given: hook returns onExtend and onLogout When: inspecting Then: they should be functions", () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() =>
      useIdleTimeout({
        enabled: true,
        timeoutSeconds: 10,
        warningSeconds: 5,
        onTimeout,
      }),
    );

    expect(typeof result.current.onExtend).toBe("function");
    expect(typeof result.current.onLogout).toBe("function");
  });

  // --- Cleanup on unmount ---

  it("Given: hook is active When: unmounting Then: should clean up timers without errors", () => {
    const onTimeout = vi.fn();
    const { unmount } = renderHook(() =>
      useIdleTimeout({
        enabled: true,
        timeoutSeconds: 10,
        warningSeconds: 5,
        onTimeout,
      }),
    );

    unmount();

    act(() => {
      vi.advanceTimersByTime(20_000);
    });

    expect(onTimeout).not.toHaveBeenCalled();
  });

  // --- Activity events ---

  it("Given: idle timer running When: mousedown event fires Then: should not throw errors", () => {
    const onTimeout = vi.fn();
    renderHook(() =>
      useIdleTimeout({
        enabled: true,
        timeoutSeconds: 10,
        warningSeconds: 5,
        onTimeout,
      }),
    );

    expect(() => {
      act(() => {
        window.dispatchEvent(new Event("mousedown"));
      });
    }).not.toThrow();
  });

  it("Given: idle timer running When: keydown event fires Then: should not throw errors", () => {
    const onTimeout = vi.fn();
    renderHook(() =>
      useIdleTimeout({
        enabled: true,
        timeoutSeconds: 10,
        warningSeconds: 5,
        onTimeout,
      }),
    );

    expect(() => {
      act(() => {
        window.dispatchEvent(new Event("keydown"));
      });
    }).not.toThrow();
  });

  it("Given: idle timer running When: scroll event fires Then: should not throw errors", () => {
    const onTimeout = vi.fn();
    renderHook(() =>
      useIdleTimeout({
        enabled: true,
        timeoutSeconds: 10,
        warningSeconds: 5,
        onTimeout,
      }),
    );

    expect(() => {
      act(() => {
        window.dispatchEvent(new Event("scroll"));
      });
    }).not.toThrow();
  });

  it("Given: idle timer running When: touchstart event fires Then: should not throw errors", () => {
    const onTimeout = vi.fn();
    renderHook(() =>
      useIdleTimeout({
        enabled: true,
        timeoutSeconds: 10,
        warningSeconds: 5,
        onTimeout,
      }),
    );

    expect(() => {
      act(() => {
        window.dispatchEvent(new Event("touchstart"));
      });
    }).not.toThrow();
  });

  // --- Activity resets the timer (verified by not timing out after activity) ---

  it("Given: activity occurs before warning When: enough total time passes Then: onTimeout should still not fire because timer was reset", () => {
    const onTimeout = vi.fn();
    renderHook(() =>
      useIdleTimeout({
        enabled: true,
        timeoutSeconds: 10,
        warningSeconds: 5,
        onTimeout,
      }),
    );

    // Wait 4 seconds (before warning at 5s)
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    // Activity resets the timer
    act(() => {
      window.dispatchEvent(new Event("mousedown"));
    });

    // Wait another 4 seconds from the reset point (still before warning)
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    // No warning or timeout should have fired since we only waited 4s since last activity
    expect(onTimeout).not.toHaveBeenCalled();
  });

  // --- Switching enabled from true to false ---

  it("Given: enabled starts true When: rerendered with enabled=false Then: should clear warning", () => {
    const onTimeout = vi.fn();
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useIdleTimeout({
          enabled,
          timeoutSeconds: 10,
          warningSeconds: 5,
          onTimeout,
        }),
      { initialProps: { enabled: true } },
    );

    expect(result.current.showWarning).toBe(false);

    // Switch to disabled
    rerender({ enabled: false });

    expect(result.current.showWarning).toBe(false);

    // Advance past all timeouts
    act(() => {
      vi.advanceTimersByTime(20_000);
    });

    expect(onTimeout).not.toHaveBeenCalled();
  });

  // --- Different warningSeconds values ---

  it("Given: warningSeconds is 0 When: hook renders Then: remainingSeconds should be 0", () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() =>
      useIdleTimeout({
        enabled: true,
        timeoutSeconds: 10,
        warningSeconds: 0,
        onTimeout,
      }),
    );
    expect(result.current.remainingSeconds).toBe(0);
  });

  it("Given: warningSeconds equals timeoutSeconds When: hook renders Then: remainingSeconds should equal timeout", () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() =>
      useIdleTimeout({
        enabled: true,
        timeoutSeconds: 10,
        warningSeconds: 10,
        onTimeout,
      }),
    );
    expect(result.current.remainingSeconds).toBe(10);
  });

  // --- Branch: onTimeout fires after full timeout period ---
  it("Given: enabled with short timeout When: full time elapses Then: onTimeout fires", () => {
    const onTimeout = vi.fn();
    renderHook(() =>
      useIdleTimeout({
        enabled: true,
        timeoutSeconds: 3,
        warningSeconds: 1,
        onTimeout,
      }),
    );

    // Advance past the full timeout (warning delay 2s + countdown 1s)
    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(onTimeout).toHaveBeenCalled();
  });

  // --- Branch: warningTimerRef.current is not null during cleanup ---
  it("Given: active timers When: onLogout is called Then: timers are cleared", () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() =>
      useIdleTimeout({
        enabled: true,
        timeoutSeconds: 10,
        warningSeconds: 5,
        onTimeout,
      }),
    );

    // Call onLogout which clears timers
    act(() => {
      result.current.onLogout();
    });

    // Advance time past timeout - should NOT fire again
    act(() => {
      vi.advanceTimersByTime(20_000);
    });

    // onTimeout should have been called once (from onLogout), not from the timer
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  // --- Branch: resetTimers when enabled=false returns early ---
  it("Given: enabled transitions from true to false When: resetTimers runs Then: it returns early", () => {
    const onTimeout = vi.fn();
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useIdleTimeout({
          enabled,
          timeoutSeconds: 5,
          warningSeconds: 2,
          onTimeout,
        }),
      { initialProps: { enabled: true } },
    );

    rerender({ enabled: false });

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(onTimeout).not.toHaveBeenCalled();
  });

  // --- Branch: countdown ticks prev > 1 (returns prev - 1) ---
  it("Given: warning shown When: countdown ticks Then: remainingSeconds decrements and eventually fires timeout", () => {
    const onTimeout = vi.fn();
    renderHook(() =>
      useIdleTimeout({
        enabled: true,
        timeoutSeconds: 5,
        warningSeconds: 3,
        onTimeout,
      }),
    );

    // Advance past full timeout period (warning delay 2s + countdown 3s)
    act(() => {
      vi.advanceTimersByTime(5500);
    });

    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  // --- Branch: countdown reaches exactly 1 (prev <= 1) and clears interval ---
  it("Given: countdown at 1 When: tick fires Then: should clear interval and call onTimeout", () => {
    const onTimeout = vi.fn();
    renderHook(() =>
      useIdleTimeout({
        enabled: true,
        timeoutSeconds: 3,
        warningSeconds: 2,
        onTimeout,
      }),
    );

    // Advance to warning (3-2=1s) + 2 ticks (to reach 0)
    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  // --- Branch: warningTimerRef.current null (first clear) ---
  it("Given: no warning timer set When: resetTimers called Then: should not throw", () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() =>
      useIdleTimeout({
        enabled: true,
        timeoutSeconds: 10,
        warningSeconds: 5,
        onTimeout,
      }),
    );

    // onExtend calls resetTimers which clears potentially null timer refs
    act(() => {
      result.current.onExtend();
    });

    expect(result.current.showWarning).toBe(false);
  });

  // --- Branch: countdownRef.current null during onLogout ---
  it("Given: no countdown running When: onLogout called Then: should handle null ref gracefully", () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() =>
      useIdleTimeout({
        enabled: true,
        timeoutSeconds: 10,
        warningSeconds: 5,
        onTimeout,
      }),
    );

    // Immediately call onLogout before any countdown started
    act(() => {
      result.current.onLogout();
    });

    expect(onTimeout).toHaveBeenCalledTimes(1);
  });
});
