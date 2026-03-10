import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

let mockCameraScannerState = {
  isActive: false,
  error: null as string | null,
  start: vi.fn(),
  stop: vi.fn(),
  backend: null as string | null,
};

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/modules/sales/presentation/hooks/use-camera-scanner", () => ({
  useCameraScanner: () => mockCameraScannerState,
}));

import { CameraScannerDialog } from "@/modules/sales/presentation/components/camera-scanner-dialog";

describe("CameraScannerDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onScan: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCameraScannerState = {
      isActive: false,
      error: null,
      start: vi.fn(),
      stop: vi.fn(),
      backend: null,
    };
  });

  it("Given: dialog is open When: rendering Then: should show dialog title", () => {
    render(<CameraScannerDialog {...defaultProps} />);
    expect(screen.getByText("cameraTitle")).toBeDefined();
  });

  it("Given: dialog is open When: rendering Then: should show dialog description", () => {
    render(<CameraScannerDialog {...defaultProps} />);
    expect(screen.getByText("cameraDescription")).toBeDefined();
  });

  it("Given: scanner is not active and no error When: rendering Then: should show start camera button", () => {
    render(<CameraScannerDialog {...defaultProps} />);
    expect(screen.getByText("startCamera")).toBeDefined();
  });

  it("Given: scanner is active When: rendering Then: should not show start camera button", () => {
    mockCameraScannerState.isActive = true;
    render(<CameraScannerDialog {...defaultProps} />);
    expect(screen.queryByText("startCamera")).toBeNull();
  });

  it("Given: scanner has error When: rendering Then: should show error message", () => {
    mockCameraScannerState.error = "Camera permission denied";
    render(<CameraScannerDialog {...defaultProps} />);
    expect(screen.getByText("Camera permission denied")).toBeDefined();
  });

  it("Given: scanner has error When: rendering Then: should not show start camera button", () => {
    mockCameraScannerState.error = "Camera permission denied";
    render(<CameraScannerDialog {...defaultProps} />);
    expect(screen.queryByText("startCamera")).toBeNull();
  });

  it("Given: scanner is active with native backend When: rendering Then: should show native backend text", () => {
    mockCameraScannerState.isActive = true;
    mockCameraScannerState.backend = "native";
    render(<CameraScannerDialog {...defaultProps} />);
    expect(screen.getByText("backendNative")).toBeDefined();
  });

  it("Given: scanner is active with zxing backend When: rendering Then: should show zxing backend text", () => {
    mockCameraScannerState.isActive = true;
    mockCameraScannerState.backend = "zxing";
    render(<CameraScannerDialog {...defaultProps} />);
    expect(screen.getByText("backendZxing")).toBeDefined();
  });

  it("Given: scanner is not active When: rendering Then: should not show backend text", () => {
    render(<CameraScannerDialog {...defaultProps} />);
    expect(screen.queryByText("backendNative")).toBeNull();
    expect(screen.queryByText("backendZxing")).toBeNull();
  });

  it("Given: dialog is open When: rendering Then: should contain a video element", () => {
    render(<CameraScannerDialog {...defaultProps} />);
    const video = document.querySelector("video");
    expect(video).not.toBeNull();
    expect(video?.getAttribute("playsInline")).not.toBeNull();
  });

  it("Given: dialog is closed When: rendering Then: should not show content", () => {
    render(<CameraScannerDialog {...defaultProps} open={false} />);
    expect(screen.queryByText("cameraTitle")).toBeNull();
  });
});
