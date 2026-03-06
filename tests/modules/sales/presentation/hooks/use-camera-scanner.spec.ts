import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCameraScanner } from "@/modules/sales/presentation/hooks/use-camera-scanner";

// ── Helpers ──────────────────────────────────────────────────────────

function createMockVideoElement() {
  return {
    srcObject: null,
    play: vi.fn().mockResolvedValue(undefined),
  } as unknown as HTMLVideoElement;
}

function createMockStream() {
  const track = { stop: vi.fn() };
  return {
    getTracks: () => [track],
    _track: track,
  } as unknown as MediaStream & { _track: { stop: ReturnType<typeof vi.fn> } };
}

// ── Mock: @zxing/browser ─────────────────────────────────────────────
// vi.fn().mockImplementation() is NOT treated as a constructor by vitest,
// so we use a real class that delegates to a spy.

const zxingStopFn = vi.fn();
const zxingDecodeFromVideoDevice = vi.fn();

vi.mock("@zxing/browser", () => ({
  BrowserMultiFormatReader: class MockBrowserMultiFormatReader {
    decodeFromVideoDevice = zxingDecodeFromVideoDevice;
  },
}));

// ── Mock: Native BarcodeDetector ─────────────────────────────────────

function installNativeBarcodeDetector(
  formats: string[] = ["ean_13", "code_128"],
) {
  const detectFn = vi.fn().mockResolvedValue([]);

  class MockBarcodeDetector {
    detect = detectFn;
    static getSupportedFormats = vi.fn().mockResolvedValue(formats);
  }

  vi.stubGlobal("BarcodeDetector", MockBarcodeDetector);
  return { detectFn };
}

function removeNativeBarcodeDetector() {
  if ("BarcodeDetector" in globalThis) {
    delete (globalThis as any).BarcodeDetector;
  }
}

// ── Setup / Teardown ─────────────────────────────────────────────────

let mockStream: ReturnType<typeof createMockStream>;

beforeEach(() => {
  mockStream = createMockStream();

  zxingStopFn.mockClear();
  zxingDecodeFromVideoDevice
    .mockReset()
    .mockResolvedValue({ stop: zxingStopFn });

  Object.defineProperty(globalThis, "navigator", {
    value: {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
    },
    writable: true,
    configurable: true,
  });

  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn().mockImplementation(() => 1),
  );
});

afterEach(() => {
  removeNativeBarcodeDetector();
  vi.clearAllMocks();
});

// Helper: start and wait for isActive
async function startAndWait(result: {
  current: ReturnType<typeof useCameraScanner>;
}) {
  await act(async () => {
    await result.current.start();
  });
  await waitFor(() => {
    expect(result.current.isActive).toBe(true);
  });
}

// ── Tests ────────────────────────────────────────────────────────────

describe("useCameraScanner", () => {
  describe("backend detection", () => {
    it("selects native backend when BarcodeDetector supports inventory formats", async () => {
      installNativeBarcodeDetector(["ean_13", "qr_code"]);
      const video = createMockVideoElement();
      const videoRef = { current: video };

      const { result } = renderHook(() =>
        useCameraScanner({ enabled: true, videoRef, onScan: vi.fn() }),
      );

      await startAndWait(result);
      expect(result.current.backend).toBe("native");
    });

    it("falls back to zxing when BarcodeDetector has no relevant formats", async () => {
      installNativeBarcodeDetector(["aztec"]);
      const video = createMockVideoElement();
      const videoRef = { current: video };

      const { result } = renderHook(() =>
        useCameraScanner({ enabled: true, videoRef, onScan: vi.fn() }),
      );

      await startAndWait(result);
      expect(result.current.backend).toBe("zxing");
    });

    it("falls back to zxing when BarcodeDetector is not in globalThis", async () => {
      removeNativeBarcodeDetector();
      const video = createMockVideoElement();
      const videoRef = { current: video };

      const { result } = renderHook(() =>
        useCameraScanner({ enabled: true, videoRef, onScan: vi.fn() }),
      );

      await startAndWait(result);
      expect(result.current.backend).toBe("zxing");
    });

    it("falls back to zxing when getSupportedFormats() throws", async () => {
      class BrokenDetector {
        static getSupportedFormats() {
          return Promise.reject(new Error("Not supported"));
        }
      }
      vi.stubGlobal("BarcodeDetector", BrokenDetector);

      const video = createMockVideoElement();
      const videoRef = { current: video };

      const { result } = renderHook(() =>
        useCameraScanner({ enabled: true, videoRef, onScan: vi.fn() }),
      );

      await startAndWait(result);
      expect(result.current.backend).toBe("zxing");
    });
  });

  describe("native backend", () => {
    it("requests camera with facingMode environment and calls video.play()", async () => {
      installNativeBarcodeDetector();
      const video = createMockVideoElement();
      const videoRef = { current: video };

      const { result } = renderHook(() =>
        useCameraScanner({ enabled: true, videoRef, onScan: vi.fn() }),
      );

      await startAndWait(result);

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: { facingMode: "environment" },
      });
      expect(video.play).toHaveBeenCalled();
    });

    it("stop() aborts scan loop and stops media tracks", async () => {
      installNativeBarcodeDetector();
      const video = createMockVideoElement();
      const videoRef = { current: video };

      const { result } = renderHook(() =>
        useCameraScanner({ enabled: true, videoRef, onScan: vi.fn() }),
      );

      await startAndWait(result);

      act(() => {
        result.current.stop();
      });

      expect(result.current.isActive).toBe(false);
      expect(mockStream._track.stop).toHaveBeenCalled();
    });
  });

  describe("zxing backend", () => {
    it("calls decodeFromVideoDevice with the video element", async () => {
      removeNativeBarcodeDetector();
      const video = createMockVideoElement();
      const videoRef = { current: video };

      const { result } = renderHook(() =>
        useCameraScanner({ enabled: true, videoRef, onScan: vi.fn() }),
      );

      await startAndWait(result);

      expect(zxingDecodeFromVideoDevice).toHaveBeenCalledWith(
        undefined,
        video,
        expect.any(Function),
      );
    });

    it("stop() calls zxing controls.stop()", async () => {
      removeNativeBarcodeDetector();
      const video = createMockVideoElement();
      const videoRef = { current: video };

      const { result } = renderHook(() =>
        useCameraScanner({ enabled: true, videoRef, onScan: vi.fn() }),
      );

      await startAndWait(result);

      act(() => {
        result.current.stop();
      });

      expect(zxingStopFn).toHaveBeenCalled();
      expect(result.current.isActive).toBe(false);
    });
  });

  describe("error handling", () => {
    it("sets 'Camera permission denied' on NotAllowedError", async () => {
      removeNativeBarcodeDetector();
      zxingDecodeFromVideoDevice.mockRejectedValueOnce(
        new DOMException("Permission denied", "NotAllowedError"),
      );

      const video = createMockVideoElement();
      const videoRef = { current: video };

      const { result } = renderHook(() =>
        useCameraScanner({ enabled: true, videoRef, onScan: vi.fn() }),
      );

      await act(async () => {
        await result.current.start();
      });

      await waitFor(() => {
        expect(result.current.error).toBe("Camera permission denied");
      });
      expect(result.current.isActive).toBe(false);
    });

    it("sets 'Failed to start camera' on generic error", async () => {
      removeNativeBarcodeDetector();
      zxingDecodeFromVideoDevice.mockRejectedValueOnce(
        new Error("Something broke"),
      );

      const video = createMockVideoElement();
      const videoRef = { current: video };

      const { result } = renderHook(() =>
        useCameraScanner({ enabled: true, videoRef, onScan: vi.fn() }),
      );

      await act(async () => {
        await result.current.start();
      });

      await waitFor(() => {
        expect(result.current.error).toBe("Failed to start camera");
      });
      expect(result.current.isActive).toBe(false);
    });

    it("does nothing if videoRef.current is null", async () => {
      const videoRef = { current: null };

      const { result } = renderHook(() =>
        useCameraScanner({ enabled: true, videoRef, onScan: vi.fn() }),
      );

      await act(async () => {
        await result.current.start();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.backend).toBeNull();
    });
  });

  describe("lifecycle", () => {
    it("calls stop on unmount", async () => {
      removeNativeBarcodeDetector();
      const video = createMockVideoElement();
      const videoRef = { current: video };

      const { result, unmount } = renderHook(() =>
        useCameraScanner({ enabled: true, videoRef, onScan: vi.fn() }),
      );

      await startAndWait(result);
      unmount();

      expect(zxingStopFn).toHaveBeenCalled();
    });

    it("calls stop when enabled changes to false", async () => {
      removeNativeBarcodeDetector();
      const video = createMockVideoElement();
      const videoRef = { current: video };
      const onScan = vi.fn();

      const { result, rerender } = renderHook(
        ({ enabled }: { enabled: boolean }) =>
          useCameraScanner({ enabled, videoRef, onScan }),
        { initialProps: { enabled: true } },
      );

      await startAndWait(result);

      await act(async () => {
        rerender({ enabled: false });
      });

      await waitFor(() => {
        expect(result.current.isActive).toBe(false);
      });
    });

    it("returns initial state before start is called", () => {
      const video = createMockVideoElement();
      const videoRef = { current: video };

      const { result } = renderHook(() =>
        useCameraScanner({ enabled: true, videoRef, onScan: vi.fn() }),
      );

      expect(result.current.isActive).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.backend).toBeNull();
    });
  });
});
