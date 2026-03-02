import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/hooks/use-debounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("Given: an initial value When: hook renders Then: should return the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 500));
    expect(result.current).toBe("hello");
  });

  it("Given: a value change When: delay has not elapsed Then: should still return the previous value", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 300 } },
    );

    rerender({ value: "updated", delay: 300 });

    // Advance only partially
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe("initial");
  });

  it("Given: a value change When: delay has elapsed Then: should return the new debounced value", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 300 } },
    );

    rerender({ value: "updated", delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("updated");
  });

  it("Given: multiple rapid value changes When: delay elapses after the last change Then: should only return the final value", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "a", delay: 500 } },
    );

    rerender({ value: "ab", delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: "abc", delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: "abcd", delay: 500 });

    // Not enough total time for the last change
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("a");

    // Now enough time passes after the final value
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("abcd");
  });

  it("Given: a numeric value When: debounce delay elapses Then: should work with non-string types", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 42, delay: 200 } },
    );

    rerender({ value: 99, delay: 200 });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe(99);
  });

  it("Given: a pending debounce When: the component unmounts Then: should clean up the timeout without updating", () => {
    const { result, rerender, unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "start", delay: 500 } },
    );

    rerender({ value: "changed", delay: 500 });

    // Unmount before the debounce fires
    unmount();

    // Advance time — the timer should be cleared, no errors
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // After unmount the last returned value was "start"
    expect(result.current).toBe("start");
  });
});
