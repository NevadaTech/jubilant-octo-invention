import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "@/hooks/use-local-storage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("Given: no stored value When: hook initializes Then: should return the initial value", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("Given: a previously stored value When: hook initializes Then: should read it from localStorage on mount", () => {
    window.localStorage.setItem("test-key", JSON.stringify("persisted-value"));

    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    expect(result.current[0]).toBe("persisted-value");
  });

  it("Given: a hook instance When: setValue is called with a direct value Then: should update state and localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");
    expect(JSON.parse(window.localStorage.getItem("test-key")!)).toBe(
      "new-value",
    );
  });

  it("Given: a hook instance When: setValue is called with a function updater Then: should use the previous value", () => {
    const { result } = renderHook(() => useLocalStorage("counter", 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(JSON.parse(window.localStorage.getItem("counter")!)).toBe(1);
  });

  it("Given: a stored object When: hook initializes Then: should deserialize it correctly", () => {
    const data = { name: "test", count: 42 };
    window.localStorage.setItem("obj-key", JSON.stringify(data));

    const { result } = renderHook(() =>
      useLocalStorage("obj-key", { name: "", count: 0 }),
    );

    expect(result.current[0]).toEqual(data);
  });

  it("Given: a stored array When: updating Then: should persist the array", () => {
    const { result } = renderHook(() =>
      useLocalStorage<string[]>("arr-key", []),
    );

    act(() => {
      result.current[1](["a", "b"]);
    });

    expect(result.current[0]).toEqual(["a", "b"]);
    expect(JSON.parse(window.localStorage.getItem("arr-key")!)).toEqual([
      "a",
      "b",
    ]);
  });
});
