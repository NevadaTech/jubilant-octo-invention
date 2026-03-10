import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePickingVerification } from "@/modules/sales/presentation/hooks/use-picking-verification";
import { SaleLine } from "@/modules/sales/domain/entities/sale.entity";

// Mock Web Audio API
vi.stubGlobal(
  "AudioContext",
  vi.fn(() => ({
    createOscillator: () => ({
      connect: vi.fn(),
      frequency: { value: 0 },
      type: "sine",
      start: vi.fn(),
      stop: vi.fn(),
    }),
    createGain: () => ({
      connect: vi.fn(),
      gain: { value: 0 },
    }),
    destination: {},
    currentTime: 0,
  })),
);

function makeLine(
  overrides: Partial<{
    id: string;
    productSku: string;
    productBarcode: string | null;
    productName: string;
    quantity: number;
  }> = {},
): SaleLine {
  return SaleLine.create({
    id: overrides.id ?? "line-1",
    productId: "p1",
    productName: overrides.productName ?? "Widget A",
    productSku: overrides.productSku ?? "WA-001",
    productBarcode: overrides.productBarcode ?? "7501234567890",
    quantity: overrides.quantity ?? 3,
    salePrice: 100,
    currency: "COP",
    totalPrice: 300,
  });
}

describe("usePickingVerification", () => {
  const lines = [
    makeLine({
      id: "l1",
      productSku: "WA-001",
      productBarcode: "1111",
      quantity: 2,
    }),
    makeLine({
      id: "l2",
      productSku: "GB-002",
      productBarcode: "2222",
      quantity: 1,
      productName: "Gadget B",
    }),
    makeLine({
      id: "l3",
      productSku: "SC-003",
      productBarcode: null,
      quantity: 3,
      productName: "Sprocket C",
    }),
  ];

  it("initializes verification lines from sale lines", () => {
    const { result } = renderHook(() => usePickingVerification(lines));

    expect(result.current.verificationLines).toHaveLength(3);
    expect(result.current.verificationLines[0].scannedCount).toBe(0);
    expect(result.current.progress.verified).toBe(0);
    expect(result.current.progress.total).toBe(3);
  });

  it("processScan matches by SKU (case-insensitive)", () => {
    const { result } = renderHook(() => usePickingVerification(lines));

    act(() => {
      const res = result.current.processScan("wa-001");
      expect(res).toBe("SUCCESS");
    });

    expect(result.current.verificationLines[0].scannedCount).toBe(1);
  });

  it("processScan matches by barcode", () => {
    const { result } = renderHook(() => usePickingVerification(lines));

    act(() => {
      const res = result.current.processScan("2222");
      expect(res).toBe("SUCCESS");
    });

    expect(result.current.verificationLines[1].scannedCount).toBe(1);
  });

  it("processScan returns NOT_FOUND for unknown barcode", () => {
    const { result } = renderHook(() => usePickingVerification(lines));

    act(() => {
      const res = result.current.processScan("UNKNOWN-CODE");
      expect(res).toBe("NOT_FOUND");
    });
  });

  it("processScan returns ALREADY_COMPLETE when line is fully scanned", () => {
    const { result } = renderHook(() => usePickingVerification(lines));

    // Scan GB-002 once (quantity is 1, so it's complete)
    act(() => {
      result.current.processScan("GB-002");
    });
    expect(result.current.verificationLines[1].scannedCount).toBe(1);

    // Scanning again should return ALREADY_COMPLETE
    act(() => {
      const res = result.current.processScan("GB-002");
      expect(res).toBe("ALREADY_COMPLETE");
    });
  });

  it("processScan works with SKU-only match (no barcode)", () => {
    const { result } = renderHook(() => usePickingVerification(lines));

    act(() => {
      const res = result.current.processScan("SC-003");
      expect(res).toBe("SUCCESS");
    });

    expect(result.current.verificationLines[2].scannedCount).toBe(1);
  });

  it("progress updates correctly", () => {
    const { result } = renderHook(() => usePickingVerification(lines));

    // Complete line 2 (quantity 1)
    act(() => {
      result.current.processScan("GB-002");
    });

    expect(result.current.progress.verified).toBe(1);
    expect(result.current.progress.total).toBe(3);
    expect(result.current.progress.percentage).toBe(33);
  });

  describe("canShipWithMode", () => {
    it("OFF and OPTIONAL always return true", () => {
      const { result } = renderHook(() => usePickingVerification(lines));

      expect(result.current.canShipWithMode("OFF")).toBe(true);
      expect(result.current.canShipWithMode("OPTIONAL")).toBe(true);
    });

    it("REQUIRED_FULL returns false until all lines fully scanned", () => {
      const { result } = renderHook(() => usePickingVerification(lines));

      expect(result.current.canShipWithMode("REQUIRED_FULL")).toBe(false);

      // Scan all of line 1 (qty 2)
      act(() => {
        result.current.processScan("WA-001");
      });
      act(() => {
        result.current.processScan("WA-001");
      });
      // Scan line 2 (qty 1)
      act(() => {
        result.current.processScan("GB-002");
      });
      // Scan all of line 3 (qty 3)
      act(() => {
        result.current.processScan("SC-003");
      });
      act(() => {
        result.current.processScan("SC-003");
      });
      act(() => {
        result.current.processScan("SC-003");
      });

      expect(result.current.canShipWithMode("REQUIRED_FULL")).toBe(true);
    });

    it("REQUIRED_PARTIAL returns false until every line has >= 1 scan", () => {
      const { result } = renderHook(() => usePickingVerification(lines));

      expect(result.current.canShipWithMode("REQUIRED_PARTIAL")).toBe(false);

      act(() => {
        result.current.processScan("WA-001");
      });
      act(() => {
        result.current.processScan("GB-002");
      });

      expect(result.current.canShipWithMode("REQUIRED_PARTIAL")).toBe(false);

      act(() => {
        result.current.processScan("SC-003");
      });

      expect(result.current.canShipWithMode("REQUIRED_PARTIAL")).toBe(true);
    });
  });

  it("resetAll resets all scan counts", () => {
    const { result } = renderHook(() => usePickingVerification(lines));

    act(() => {
      result.current.processScan("WA-001");
    });
    act(() => {
      result.current.processScan("GB-002");
    });

    act(() => {
      result.current.resetAll();
    });

    expect(
      result.current.verificationLines.every((v) => v.scannedCount === 0),
    ).toBe(true);
    expect(result.current.lastScanResult).toBeNull();
  });

  it("resetLine resets only the specified line", () => {
    const { result } = renderHook(() => usePickingVerification(lines));

    act(() => {
      result.current.processScan("WA-001");
    });
    act(() => {
      result.current.processScan("GB-002");
    });

    act(() => {
      result.current.resetLine("l1");
    });

    expect(result.current.verificationLines[0].scannedCount).toBe(0);
    expect(result.current.verificationLines[1].scannedCount).toBe(1);
  });

  it("processScan returns NOT_FOUND for empty string", () => {
    const { result } = renderHook(() => usePickingVerification(lines));

    act(() => {
      const res = result.current.processScan("");
      expect(res).toBe("NOT_FOUND");
    });
  });

  it("processScan returns NOT_FOUND for whitespace-only string", () => {
    const { result } = renderHook(() => usePickingVerification(lines));

    act(() => {
      const res = result.current.processScan("   ");
      expect(res).toBe("NOT_FOUND");
    });
  });

  it("processScan matches by barcode when SKU doesn't match", () => {
    const { result } = renderHook(() => usePickingVerification(lines));

    act(() => {
      const res = result.current.processScan("1111");
      expect(res).toBe("SUCCESS");
    });

    expect(result.current.verificationLines[0].scannedCount).toBe(1);
  });

  it("processScan ALREADY_COMPLETE via barcode match", () => {
    const singleLine = [
      makeLine({
        id: "l1",
        productSku: "X-001",
        productBarcode: "BAR-1",
        quantity: 1,
      }),
    ];
    const { result } = renderHook(() => usePickingVerification(singleLine));

    act(() => {
      result.current.processScan("BAR-1");
    });

    act(() => {
      const res = result.current.processScan("BAR-1");
      expect(res).toBe("ALREADY_COMPLETE");
    });
  });

  it("progress returns 100% when there are 0 lines", () => {
    const { result } = renderHook(() => usePickingVerification([]));

    expect(result.current.progress.percentage).toBe(100);
    expect(result.current.progress.total).toBe(0);
    expect(result.current.progress.verified).toBe(0);
  });

  it("canShipWithMode returns true for unknown mode (default case)", () => {
    const { result } = renderHook(() => usePickingVerification(lines));

    // Cast to any to test the default branch
    expect(result.current.canShipWithMode("UNKNOWN_MODE" as any)).toBe(true);
  });

  it("lastScanResult is set after successful scan", () => {
    const { result } = renderHook(() => usePickingVerification(lines));

    act(() => {
      result.current.processScan("WA-001");
    });

    expect(result.current.lastScanResult).not.toBeNull();
    expect(result.current.lastScanResult!.result).toBe("SUCCESS");
    expect(result.current.lastScanResult!.message).toContain("Widget A");
  });

  it("lastScanResult is set after NOT_FOUND scan", () => {
    const { result } = renderHook(() => usePickingVerification(lines));

    act(() => {
      result.current.processScan("UNKNOWN");
    });

    expect(result.current.lastScanResult!.result).toBe("NOT_FOUND");
    expect(result.current.lastScanResult!.message).toContain("UNKNOWN");
  });

  it("lastScanResult is set after ALREADY_COMPLETE scan", () => {
    const singleLine = [
      makeLine({
        id: "l1",
        productSku: "X-001",
        productBarcode: null,
        quantity: 1,
      }),
    ];
    const { result } = renderHook(() => usePickingVerification(singleLine));

    act(() => {
      result.current.processScan("X-001");
    });
    act(() => {
      result.current.processScan("X-001");
    });

    expect(result.current.lastScanResult!.result).toBe("ALREADY_COMPLETE");
  });

  it("re-initializes lines when lines prop changes and preserves scan counts", () => {
    const initialLines = [
      makeLine({ id: "l1", productSku: "A-001", quantity: 2 }),
    ];
    const { result, rerender } = renderHook(
      (props: { lines: typeof initialLines }) =>
        usePickingVerification(props.lines),
      { initialProps: { lines: initialLines } },
    );

    act(() => {
      result.current.processScan("A-001");
    });
    expect(result.current.verificationLines[0].scannedCount).toBe(1);

    // Change lines
    const newLines = [
      makeLine({ id: "l1", productSku: "A-001", quantity: 3 }),
      makeLine({ id: "l2", productSku: "B-002", quantity: 1 }),
    ];
    rerender({ lines: newLines });

    expect(result.current.verificationLines).toHaveLength(2);
    // l1 preserves its scan count
    expect(result.current.verificationLines[0].scannedCount).toBe(1);
    // l2 is new, starts at 0
    expect(result.current.verificationLines[1].scannedCount).toBe(0);
  });

  it("Given: AudioContext throws When: processScan succeeds Then: should not throw", () => {
    // Temporarily make AudioContext throw
    const origAudioCtx = globalThis.AudioContext;
    vi.stubGlobal(
      "AudioContext",
      vi.fn(() => {
        throw new Error("Not supported");
      }),
    );

    const singleLine = [
      makeLine({ id: "l1", productSku: "A-001", quantity: 2 }),
    ];
    const { result } = renderHook(() => usePickingVerification(singleLine));

    act(() => {
      const res = result.current.processScan("A-001");
      expect(res).toBe("SUCCESS");
    });

    vi.stubGlobal("AudioContext", origAudioCtx);
  });

  it("handles duplicate SKUs by filling first incomplete match", () => {
    const dupLines = [
      makeLine({
        id: "d1",
        productSku: "DUP-001",
        productBarcode: "AAA",
        quantity: 1,
        productName: "Item A",
      }),
      makeLine({
        id: "d2",
        productSku: "DUP-001",
        productBarcode: "BBB",
        quantity: 1,
        productName: "Item B",
      }),
    ];

    const { result } = renderHook(() => usePickingVerification(dupLines));

    // First scan fills first line
    act(() => {
      result.current.processScan("DUP-001");
    });
    expect(result.current.verificationLines[0].scannedCount).toBe(1);
    expect(result.current.verificationLines[1].scannedCount).toBe(0);

    // Second scan fills second line (first is already complete)
    act(() => {
      result.current.processScan("DUP-001");
    });
    expect(result.current.verificationLines[1].scannedCount).toBe(1);
  });
});
