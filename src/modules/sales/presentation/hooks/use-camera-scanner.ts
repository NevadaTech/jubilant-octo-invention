"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseCameraScannerProps {
  enabled: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onScan: (barcode: string) => void;
}

type ScannerBackend = "native" | "zxing";

const INVENTORY_BARCODE_FORMATS = [
  "ean_13",
  "ean_8",
  "upc_a",
  "upc_e",
  "code_128",
  "code_39",
  "itf",
  "codabar",
  "qr_code",
  "data_matrix",
];

/**
 * Detect which scanner backend is available.
 * Prefers the native BarcodeDetector API (Chrome/Edge/Android), falls back to @zxing/browser.
 */
async function detectBackend(): Promise<ScannerBackend> {
  if ("BarcodeDetector" in globalThis) {
    try {
      const supported = await BarcodeDetector.getSupportedFormats();
      // Need at least one inventory-relevant format
      if (supported.some((f) => INVENTORY_BARCODE_FORMATS.includes(f))) {
        return "native";
      }
    } catch {
      // getSupportedFormats failed — fall through to zxing
    }
  }
  return "zxing";
}

async function startNativeScanner(
  video: HTMLVideoElement,
  onScan: (barcode: string) => void,
  signal: AbortSignal,
): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
  });
  video.srcObject = stream;
  await video.play();

  const formats = await BarcodeDetector.getSupportedFormats();
  const relevantFormats = formats.filter((f) =>
    INVENTORY_BARCODE_FORMATS.includes(f),
  );
  const detector = new BarcodeDetector({ formats: relevantFormats });

  let lastValue = "";
  let lastTime = 0;
  const DEBOUNCE_MS = 1500;

  const scanFrame = async () => {
    if (signal.aborted) return;

    try {
      const barcodes = await detector.detect(video);
      if (barcodes.length > 0) {
        const value = barcodes[0].rawValue;
        const now = Date.now();
        // Debounce repeated scans of the same barcode
        if (value && (value !== lastValue || now - lastTime > DEBOUNCE_MS)) {
          lastValue = value;
          lastTime = now;
          onScan(value);
        }
      }
    } catch {
      // Frame decode failed — skip silently
    }

    if (!signal.aborted) {
      requestAnimationFrame(scanFrame);
    }
  };

  requestAnimationFrame(scanFrame);
  return stream;
}

async function startZxingScanner(
  video: HTMLVideoElement,
  onScan: (barcode: string) => void,
): Promise<{ stop: () => void }> {
  const { BrowserMultiFormatReader } = await import("@zxing/browser");
  const reader = new BrowserMultiFormatReader();

  const controls = await reader.decodeFromVideoDevice(
    undefined,
    video,
    (result) => {
      if (result) {
        onScan(result.getText());
      }
    },
  );

  return controls;
}

export function useCameraScanner({
  enabled,
  videoRef,
  onScan,
}: UseCameraScannerProps) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backend, setBackend] = useState<ScannerBackend | null>(null);

  // Cleanup refs
  const abortRef = useRef<AbortController | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const zxingControlsRef = useRef<{ stop: () => void } | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    zxingControlsRef.current?.stop();
    zxingControlsRef.current = null;

    setIsActive(false);
  }, []);

  const start = useCallback(async () => {
    if (!videoRef.current) return;
    setError(null);

    try {
      const selectedBackend = await detectBackend();
      setBackend(selectedBackend);

      if (selectedBackend === "native") {
        const controller = new AbortController();
        abortRef.current = controller;

        const stream = await startNativeScanner(
          videoRef.current,
          onScan,
          controller.signal,
        );
        streamRef.current = stream;
      } else {
        const controls = await startZxingScanner(videoRef.current, onScan);
        zxingControlsRef.current = controls;
      }

      setIsActive(true);
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera permission denied"
          : "Failed to start camera";
      setError(message);
      setIsActive(false);
    }
  }, [videoRef, onScan]);

  // Cleanup on unmount or disable
  useEffect(() => {
    if (!enabled) {
      stop();
    }
    return () => {
      stop();
    };
  }, [enabled, stop]);

  return { isActive, error, start, stop, backend };
}
