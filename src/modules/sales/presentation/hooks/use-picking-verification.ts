"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import type { SaleLine } from "@/modules/sales/domain/entities/sale.entity";
import type { PickingMode } from "./use-picking-config";

export type ScanResult = "SUCCESS" | "ALREADY_COMPLETE" | "NOT_FOUND";

export interface VerificationLine {
  lineId: string;
  productSku: string;
  productBarcode: string | null;
  productName: string;
  requiredQty: number;
  scannedCount: number;
}

export interface VerificationProgress {
  verified: number;
  total: number;
  percentage: number;
}

// Audio feedback via Web Audio API
function playBeep(success: boolean) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = success ? 880 : 300;
    osc.type = success ? "sine" : "square";
    gain.gain.value = 0.15;
    osc.start();
    osc.stop(ctx.currentTime + (success ? 0.12 : 0.25));
  } catch {
    // Web Audio not available — silent fail
  }
}

export function usePickingVerification(lines: SaleLine[]) {
  const [verificationLines, setVerificationLines] = useState<
    VerificationLine[]
  >(() =>
    lines.map((line) => ({
      lineId: line.id,
      productSku: line.productSku,
      productBarcode: line.productBarcode,
      productName: line.productName,
      requiredQty: line.quantity,
      scannedCount: 0,
    })),
  );

  const [lastScanResult, setLastScanResult] = useState<{
    result: ScanResult;
    message: string;
  } | null>(null);

  const linesInitRef = useRef(lines);
  // Re-initialize when lines change (e.g., sale refetched)
  if (lines !== linesInitRef.current && lines.length > 0) {
    const currentMap = new Map(
      verificationLines.map((v) => [v.lineId, v.scannedCount]),
    );
    const newLines = lines.map((line) => ({
      lineId: line.id,
      productSku: line.productSku,
      productBarcode: line.productBarcode,
      productName: line.productName,
      requiredQty: line.quantity,
      scannedCount: currentMap.get(line.id) ?? 0,
    }));
    setVerificationLines(newLines);
    linesInitRef.current = lines;
  }

  const processScan = useCallback(
    (barcode: string): ScanResult => {
      const trimmed = barcode.trim();
      if (!trimmed) return "NOT_FOUND";

      let matchIndex = -1;

      // Find first incomplete line matching by SKU
      matchIndex = verificationLines.findIndex(
        (v) =>
          v.productSku.toLowerCase() === trimmed.toLowerCase() &&
          v.scannedCount < v.requiredQty,
      );

      // If no SKU match, try barcode
      if (matchIndex === -1) {
        matchIndex = verificationLines.findIndex(
          (v) =>
            v.productBarcode !== null &&
            v.productBarcode.toLowerCase() === trimmed.toLowerCase() &&
            v.scannedCount < v.requiredQty,
        );
      }

      // If still no match, check if it's already complete
      if (matchIndex === -1) {
        const anyMatch = verificationLines.some(
          (v) =>
            v.productSku.toLowerCase() === trimmed.toLowerCase() ||
            (v.productBarcode !== null &&
              v.productBarcode.toLowerCase() === trimmed.toLowerCase()),
        );

        if (anyMatch) {
          playBeep(false);
          const msg = "Already fully scanned";
          setLastScanResult({ result: "ALREADY_COMPLETE", message: msg });
          return "ALREADY_COMPLETE";
        }

        playBeep(false);
        setLastScanResult({
          result: "NOT_FOUND",
          message: `"${trimmed}" not found`,
        });
        return "NOT_FOUND";
      }

      // Increment scanned count
      setVerificationLines((prev) =>
        prev.map((v, i) =>
          i === matchIndex ? { ...v, scannedCount: v.scannedCount + 1 } : v,
        ),
      );

      playBeep(true);
      const matched = verificationLines[matchIndex];
      const newCount = matched.scannedCount + 1;
      setLastScanResult({
        result: "SUCCESS",
        message: `${matched.productName} (${newCount}/${matched.requiredQty})`,
      });
      return "SUCCESS";
    },
    [verificationLines],
  );

  const progress = useMemo((): VerificationProgress => {
    const verified = verificationLines.filter(
      (v) => v.scannedCount >= v.requiredQty,
    ).length;
    const total = verificationLines.length;
    const percentage = total === 0 ? 100 : Math.round((verified / total) * 100);
    return { verified, total, percentage };
  }, [verificationLines]);

  const canShipWithMode = useCallback(
    (mode: PickingMode): boolean => {
      switch (mode) {
        case "OFF":
        case "OPTIONAL":
          return true;
        case "REQUIRED_FULL":
          return verificationLines.every(
            (v) => v.scannedCount >= v.requiredQty,
          );
        case "REQUIRED_PARTIAL":
          return verificationLines.every((v) => v.scannedCount >= 1);
        default:
          return true;
      }
    },
    [verificationLines],
  );

  const resetLine = useCallback((lineId: string) => {
    setVerificationLines((prev) =>
      prev.map((v) => (v.lineId === lineId ? { ...v, scannedCount: 0 } : v)),
    );
  }, []);

  const resetAll = useCallback(() => {
    setVerificationLines((prev) =>
      prev.map((v) => ({ ...v, scannedCount: 0 })),
    );
    setLastScanResult(null);
  }, []);

  return {
    verificationLines,
    processScan,
    progress,
    canShipWithMode,
    resetLine,
    resetAll,
    lastScanResult,
  };
}
