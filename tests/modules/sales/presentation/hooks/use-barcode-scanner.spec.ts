import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBarcodeScanner } from "@/modules/sales/presentation/hooks/use-barcode-scanner";

describe("useBarcodeScanner", () => {
  let onScan: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onScan = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function fireRapidKeys(keys: string) {
    for (const key of keys) {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key, bubbles: true }),
      );
    }
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
  }

  it("fires onScan when rapid keystrokes end with Enter", () => {
    renderHook(() => useBarcodeScanner({ enabled: true, onScan }));

    fireRapidKeys("ABC123");

    expect(onScan).toHaveBeenCalledWith("ABC123");
  });

  it("does not fire onScan for short input (< 3 chars)", () => {
    renderHook(() => useBarcodeScanner({ enabled: true, onScan }));

    fireRapidKeys("AB");

    expect(onScan).not.toHaveBeenCalled();
  });

  it("does not fire when disabled", () => {
    renderHook(() => useBarcodeScanner({ enabled: false, onScan }));

    fireRapidKeys("ABC123");

    expect(onScan).not.toHaveBeenCalled();
  });

  it("resets buffer on slow typing (> 80ms gap)", () => {
    renderHook(() => useBarcodeScanner({ enabled: true, onScan }));

    // Type 'A' then wait 100ms, then 'BC' + Enter
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "A" }));
    vi.advanceTimersByTime(100);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "B" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "C" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    // 'A' should have been discarded — only 'BC' is in buffer which is < 3 chars
    expect(onScan).not.toHaveBeenCalled();
  });

  it("prevents event propagation when a valid barcode is detected", () => {
    renderHook(() => useBarcodeScanner({ enabled: true, onScan }));

    // Fire rapid keys
    for (const key of "ABC123") {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key, bubbles: true }),
      );
    }

    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    const stopSpy = vi.spyOn(enterEvent, "stopImmediatePropagation");
    const preventSpy = vi.spyOn(enterEvent, "preventDefault");

    window.dispatchEvent(enterEvent);

    expect(onScan).toHaveBeenCalledWith("ABC123");
    expect(stopSpy).toHaveBeenCalled();
    expect(preventSpy).toHaveBeenCalled();
  });

  it("does not prevent propagation for Enter without valid barcode buffer", () => {
    renderHook(() => useBarcodeScanner({ enabled: true, onScan }));

    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    const stopSpy = vi.spyOn(enterEvent, "stopImmediatePropagation");

    window.dispatchEvent(enterEvent);

    expect(onScan).not.toHaveBeenCalled();
    expect(stopSpy).not.toHaveBeenCalled();
  });

  it("cleans up event listener on unmount", () => {
    const spy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() =>
      useBarcodeScanner({ enabled: true, onScan }),
    );

    unmount();

    expect(spy).toHaveBeenCalledWith("keydown", expect.any(Function), true);
    spy.mockRestore();
  });
});
