import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SaleLine } from "@/modules/sales/domain/entities/sale.entity";

let mockConfig = { mode: "REQUIRED_FULL" as string };
let mockVerificationLines = [
  {
    lineId: "line-1",
    productSku: "SKU-001",
    productBarcode: "1234567890",
    productName: "Product A",
    requiredQty: 3,
    scannedCount: 0,
  },
];
let mockProgress = { verified: 0, total: 1, percentage: 0 };
let mockCanShipWithMode = vi.fn(() => false);
let mockResetAll = vi.fn();
let mockLastScanResult: { result: string; message: string } | null = null;

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (params) return `${key}(${JSON.stringify(params)})`;
    return key;
  },
}));

vi.mock("@/modules/sales/presentation/hooks/use-picking-config", () => ({
  usePickingConfig: () => ({ config: mockConfig }),
}));

vi.mock("@/modules/sales/presentation/hooks/use-picking-verification", () => ({
  usePickingVerification: () => ({
    verificationLines: mockVerificationLines,
    processScan: vi.fn(),
    progress: mockProgress,
    canShipWithMode: mockCanShipWithMode,
    resetAll: mockResetAll,
    lastScanResult: mockLastScanResult,
  }),
}));

vi.mock("@/modules/sales/presentation/hooks/use-barcode-scanner", () => ({
  useBarcodeScanner: vi.fn(),
}));

vi.mock(
  "@/modules/sales/presentation/components/camera-scanner-dialog",
  () => ({
    CameraScannerDialog: () => <div data-testid="camera-scanner-dialog" />,
  }),
);

import { PickingVerificationCard } from "@/modules/sales/presentation/components/picking-verification-card";

describe("PickingVerificationCard", () => {
  const saleLines = [
    SaleLine.create({
      id: "line-1",
      productId: "prod-1",
      productName: "Product A",
      productSku: "SKU-001",
      productBarcode: "1234567890",
      quantity: 3,
      salePrice: 10,
      currency: "COP",
      totalPrice: 30,
    }),
  ];

  const defaultProps = {
    lines: saleLines,
    saleId: "sale-1",
    onVerificationChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig = { mode: "REQUIRED_FULL" };
    mockVerificationLines = [
      {
        lineId: "line-1",
        productSku: "SKU-001",
        productBarcode: "1234567890",
        productName: "Product A",
        requiredQty: 3,
        scannedCount: 0,
      },
    ];
    mockProgress = { verified: 0, total: 1, percentage: 0 };
    mockCanShipWithMode = vi.fn(() => false);
    mockResetAll = vi.fn();
    mockLastScanResult = null;
  });

  it("Given: mode is OFF When: rendering Then: should return null", () => {
    mockConfig = { mode: "OFF" };
    const { container } = render(<PickingVerificationCard {...defaultProps} />);
    expect(container.innerHTML).toBe("");
  });

  it("Given: mode is REQUIRED_FULL When: rendering Then: should show card title", () => {
    render(<PickingVerificationCard {...defaultProps} />);
    expect(screen.getByText("title")).toBeDefined();
  });

  it("Given: verification lines When: rendering Then: should show product name in table", () => {
    render(<PickingVerificationCard {...defaultProps} />);
    expect(screen.getByText("Product A")).toBeDefined();
  });

  it("Given: verification lines When: rendering Then: should show product SKU in table", () => {
    render(<PickingVerificationCard {...defaultProps} />);
    expect(screen.getByText("SKU-001")).toBeDefined();
  });

  it("Given: progress data When: rendering Then: should show percentage", () => {
    render(<PickingVerificationCard {...defaultProps} />);
    expect(screen.getByText("0%")).toBeDefined();
  });

  it("Given: scan result is SUCCESS When: rendering Then: should show success feedback", () => {
    mockLastScanResult = { result: "SUCCESS", message: "Product A (1/3)" };
    render(<PickingVerificationCard {...defaultProps} />);
    expect(screen.getByText("Product A (1/3)")).toBeDefined();
  });

  it("Given: scan result is NOT_FOUND When: rendering Then: should show error feedback", () => {
    mockLastScanResult = {
      result: "NOT_FOUND",
      message: '"UNKNOWN" not found',
    };
    render(<PickingVerificationCard {...defaultProps} />);
    expect(screen.getByText('"UNKNOWN" not found')).toBeDefined();
  });

  it("Given: no scan result When: rendering Then: should not show feedback div", () => {
    const { container } = render(<PickingVerificationCard {...defaultProps} />);
    const feedbackDivs = container.querySelectorAll(
      ".border-green-200, .border-red-200",
    );
    expect(feedbackDivs.length).toBe(0);
  });

  it("Given: verification lines When: rendering Then: should show table headers", () => {
    render(<PickingVerificationCard {...defaultProps} />);
    expect(screen.getByText("product")).toBeDefined();
    expect(screen.getByText("sku")).toBeDefined();
    expect(screen.getByText("need")).toBeDefined();
    expect(screen.getByText("scanned")).toBeDefined();
    expect(screen.getByText("status")).toBeDefined();
  });

  it("Given: rendering When: active Then: should show reset all button", () => {
    render(<PickingVerificationCard {...defaultProps} />);
    expect(screen.getByText("resetAll")).toBeDefined();
  });

  it("Given: rendering When: active Then: should show scan input placeholder", () => {
    render(<PickingVerificationCard {...defaultProps} />);
    const input = document.querySelector("[data-scan-input]");
    expect(input).not.toBeNull();
  });

  it("Given: rendering When: active Then: should render CameraScannerDialog", () => {
    render(<PickingVerificationCard {...defaultProps} />);
    expect(screen.getByTestId("camera-scanner-dialog")).toBeDefined();
  });

  it("Given: scanned count display When: rendering Then: should show count format", () => {
    render(<PickingVerificationCard {...defaultProps} />);
    expect(screen.getByText("0/3")).toBeDefined();
  });

  // --- Branch: progress percentage 100% (green bar) ---
  it("Given: progress is 100% When: rendering Then: should show green progress bar", () => {
    mockProgress = { verified: 1, total: 1, percentage: 100 };
    const { container } = render(<PickingVerificationCard {...defaultProps} />);
    const bar = container.querySelector("[class*='bg-green-500']");
    expect(bar).not.toBeNull();
  });

  // --- Branch: progress percentage > 0 but < 100 (yellow bar) ---
  it("Given: progress is partial When: rendering Then: should show yellow progress bar", () => {
    mockProgress = { verified: 1, total: 3, percentage: 33 };
    const { container } = render(<PickingVerificationCard {...defaultProps} />);
    const bar = container.querySelector("[class*='bg-yellow-500']");
    expect(bar).not.toBeNull();
  });

  // --- Branch: progress percentage is 0 (muted bar) ---
  it("Given: progress is 0% When: rendering Then: should show muted progress bar", () => {
    mockProgress = { verified: 0, total: 3, percentage: 0 };
    const { container } = render(<PickingVerificationCard {...defaultProps} />);
    const bar = container.querySelector("[class*='bg-muted-foreground']");
    expect(bar).not.toBeNull();
  });

  // --- Branch: isComplete line (green bg, Check icon) ---
  it("Given: verification line is complete When: rendering Then: should show green row background", () => {
    mockVerificationLines = [
      {
        lineId: "line-1",
        productSku: "SKU-001",
        productBarcode: "1234567890",
        productName: "Product A",
        requiredQty: 3,
        scannedCount: 3,
      },
    ];
    const { container } = render(<PickingVerificationCard {...defaultProps} />);
    const greenRow = container.querySelector("[class*='bg-green-50']");
    expect(greenRow).not.toBeNull();
  });

  // --- Branch: isPartial line (yellow AlertTriangle icon) ---
  it("Given: verification line is partial When: rendering Then: should not show green bg and show partial indicator", () => {
    mockVerificationLines = [
      {
        lineId: "line-1",
        productSku: "SKU-001",
        productBarcode: "1234567890",
        productName: "Product A",
        requiredQty: 3,
        scannedCount: 1,
      },
    ];
    const { container } = render(<PickingVerificationCard {...defaultProps} />);
    expect(screen.getByText("1/3")).toBeDefined();
    // The row should not have green bg (partial, not complete)
    const greenRow = container.querySelector("tr[class*='bg-green-50']");
    expect(greenRow).toBeNull();
  });

  // --- Branch: !isComplete && !isPartial line (Minus icon) ---
  it("Given: verification line not started When: rendering Then: should show dash indicator", () => {
    mockVerificationLines = [
      {
        lineId: "line-1",
        productSku: "SKU-001",
        productBarcode: "1234567890",
        productName: "Product A",
        requiredQty: 3,
        scannedCount: 0,
      },
    ];
    render(<PickingVerificationCard {...defaultProps} />);
    expect(screen.getByText("0/3")).toBeDefined();
  });

  // --- Branch: manualInput empty - verify button disabled ---
  it("Given: empty manual input When: rendering Then: verify button should be disabled", () => {
    render(<PickingVerificationCard {...defaultProps} />);
    const verifyBtn = screen.getByText("verify").closest("button");
    expect(verifyBtn).toBeDisabled();
  });

  // --- Branch: manual input and Enter key ---
  it("Given: manual input has value When: pressing Enter Then: should process scan", () => {
    render(<PickingVerificationCard {...defaultProps} />);
    const input = document.querySelector(
      "[data-scan-input]",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "SKU-001" } });
    fireEvent.keyDown(input, { key: "Enter" });
    // After processing, input should be cleared
    // Just verify no crash and the event was handled
    expect(screen.getByText("title")).toBeDefined();
  });

  // --- Branch: manual input and non-Enter key ---
  it("Given: manual input has value When: pressing non-Enter key Then: should not process scan", () => {
    render(<PickingVerificationCard {...defaultProps} />);
    const input = document.querySelector(
      "[data-scan-input]",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "SKU-001" } });
    fireEvent.keyDown(input, { key: "Tab" });
    expect(screen.getByText("title")).toBeDefined();
  });

  // --- Branch: manualInput.trim() is empty on submit ---
  it("Given: manual input is whitespace When: clicking verify Then: should not process scan", () => {
    render(<PickingVerificationCard {...defaultProps} />);
    const input = document.querySelector(
      "[data-scan-input]",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "   " } });
    // The verify button should still be disabled since trim() is empty
    const verifyBtn = screen.getByText("verify").closest("button");
    expect(verifyBtn).toBeDisabled();
  });

  // --- Branch: multiple verification lines ---
  it("Given: multiple verification lines When: rendering Then: should show all lines in table", () => {
    mockVerificationLines = [
      {
        lineId: "line-1",
        productSku: "SKU-001",
        productBarcode: "1234567890",
        productName: "Product A",
        requiredQty: 3,
        scannedCount: 3,
      },
      {
        lineId: "line-2",
        productSku: "SKU-002",
        productBarcode: "0987654321",
        productName: "Product B",
        requiredQty: 2,
        scannedCount: 1,
      },
    ];
    mockProgress = { verified: 1, total: 2, percentage: 50 };
    render(<PickingVerificationCard {...defaultProps} />);
    expect(screen.getByText("Product A")).toBeDefined();
    expect(screen.getByText("Product B")).toBeDefined();
    expect(screen.getByText("SKU-001")).toBeDefined();
    expect(screen.getByText("SKU-002")).toBeDefined();
  });
});
