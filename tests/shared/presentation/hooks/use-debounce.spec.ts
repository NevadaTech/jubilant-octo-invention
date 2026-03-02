import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useDebounce,
  useDebouncedCallback,
} from "@/shared/presentation/hooks/use-debounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("Given: an initial value When: hook is called Then: should return the initial value immediately", () => {
    // Arrange & Act
    const { result } = renderHook(() => useDebounce("test", 300));

    // Assert
    expect(result.current).toBe("test");
  });

  it("Given: a value update When: delay has not passed Then: should not update the debounced value", () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } },
    );

    // Act
    rerender({ value: "updated" });

    // Assert - value should still be initial before delay
    expect(result.current).toBe("initial");
  });

  it("Given: a value update When: delay has passed Then: should update the debounced value", () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } },
    );

    // Act
    rerender({ value: "updated" });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Assert
    expect(result.current).toBe("updated");
  });

  it("Given: multiple rapid value updates When: delay passes Then: should only use the last value", () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } },
    );

    // Act - simulate rapid typing
    rerender({ value: "t" });
    act(() => {
      vi.advanceTimersByTime(50);
    });

    rerender({ value: "te" });
    act(() => {
      vi.advanceTimersByTime(50);
    });

    rerender({ value: "tes" });
    act(() => {
      vi.advanceTimersByTime(50);
    });

    rerender({ value: "test" });

    // Value should still be initial since we keep resetting the timer
    expect(result.current).toBe("initial");

    // Now wait for the full delay
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Assert - should have the final value
    expect(result.current).toBe("test");
  });

  it("Given: a custom delay When: debouncing Then: should respect the custom delay", () => {
    // Arrange
    const customDelay = 500;
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, customDelay),
      { initialProps: { value: "initial" } },
    );

    // Act
    rerender({ value: "updated" });

    // Advance less than custom delay
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("initial");

    // Advance past custom delay
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Assert
    expect(result.current).toBe("updated");
  });

  it("Given: different value types When: debouncing Then: should work with any type", () => {
    // Test with number
    const { result: numberResult, rerender: rerenderNumber } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 0 } },
    );

    rerenderNumber({ value: 42 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(numberResult.current).toBe(42);

    // Test with object
    const initialObj = { name: "initial" };
    const updatedObj = { name: "updated" };
    const { result: objectResult, rerender: rerenderObject } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: initialObj } },
    );

    rerenderObject({ value: updatedObj });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(objectResult.current).toEqual(updatedObj);

    // Test with boolean
    const { result: boolResult, rerender: rerenderBool } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: false } },
    );

    rerenderBool({ value: true });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(boolResult.current).toBe(true);
  });

  it("Given: default delay When: no delay specified Then: should use 300ms", () => {
    // Arrange
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: "initial" },
    });

    // Act
    rerender({ value: "updated" });

    // Advance 299ms - should still be initial
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("initial");

    // Advance 1 more ms - should now be updated
    act(() => {
      vi.advanceTimersByTime(1);
    });

    // Assert
    expect(result.current).toBe("updated");
  });
});

describe("useDebouncedCallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("Given: a callback When: debounced function is called and delay passes Then: should invoke the original callback", () => {
    // Arrange
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    // Act
    act(() => {
      result.current("arg1");
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Assert
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("arg1");
  });

  it("Given: a callback When: debounced function is called but delay has not passed Then: should not invoke callback", () => {
    // Arrange
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    // Act
    act(() => {
      result.current("arg1");
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Assert
    expect(callback).not.toHaveBeenCalled();
  });

  it("Given: multiple rapid calls When: delay passes after last call Then: should only invoke callback once with last args", () => {
    // Arrange
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    // Act
    act(() => {
      result.current("first");
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current("second");
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current("third");
    });

    // Advance past the debounce window from last call
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Assert
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("third");
  });

  it("Given: a default delay When: no delay specified Then: should use 300ms", () => {
    // Arrange
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback));

    // Act
    act(() => {
      result.current("value");
    });

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    // Assert
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("Given: a mounted hook When: unmounting before delay Then: should clean up the timeout", () => {
    // Arrange
    const callback = vi.fn();
    const { result, unmount } = renderHook(() =>
      useDebouncedCallback(callback, 300),
    );

    // Act
    act(() => {
      result.current("value");
    });
    unmount();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Assert - callback should not fire after unmount
    expect(callback).not.toHaveBeenCalled();
  });
});
