import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

let mockPickingState: {
  config: { mode: string };
  setConfig: ReturnType<typeof vi.fn>;
  pickingEnabled: boolean;
  setPickingEnabled: ReturnType<typeof vi.fn>;
  isLoading: boolean;
  isSaving: boolean;
};

vi.mock("@/modules/sales/presentation/hooks/use-picking-config", () => ({
  usePickingConfig: () => mockPickingState,
}));

import { PickingConfigForm } from "@/modules/settings/presentation/components/picking-config-form";

describe("PickingConfigForm", () => {
  beforeEach(() => {
    mockPickingState = {
      config: { mode: "OFF" },
      setConfig: vi.fn(),
      pickingEnabled: false,
      setPickingEnabled: vi.fn(),
      isLoading: false,
      isSaving: false,
    };
  });

  // ── Loading state ───────────────────────────────────────────────────

  it("Given: config is loading When: rendering Then: should show skeleton placeholders", () => {
    mockPickingState.isLoading = true;
    const { container } = render(<PickingConfigForm />);
    const skeletons = container.querySelectorAll(
      "[class*='animate-pulse'], [data-slot='skeleton']",
    );
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("Given: config is loading When: rendering Then: should not show the enable title", () => {
    mockPickingState.isLoading = true;
    render(<PickingConfigForm />);
    expect(screen.queryByText("enableTitle")).not.toBeInTheDocument();
  });

  // ── Loaded state with picking disabled ──────────────────────────────

  it("Given: config loaded with picking disabled When: rendering Then: should show the enable title", () => {
    render(<PickingConfigForm />);
    expect(screen.getByText("enableTitle")).toBeInTheDocument();
  });

  it("Given: config loaded with picking disabled When: rendering Then: should show the enable description", () => {
    render(<PickingConfigForm />);
    expect(screen.getByText("enableDescription")).toBeInTheDocument();
  });

  it("Given: config loaded When: rendering Then: should show the mode section title", () => {
    render(<PickingConfigForm />);
    expect(screen.getByText("title")).toBeInTheDocument();
  });

  it("Given: config loaded When: rendering Then: should show the mode section description", () => {
    render(<PickingConfigForm />);
    expect(screen.getByText("description")).toBeInTheDocument();
  });

  it("Given: config loaded When: rendering Then: should show all four mode options", () => {
    render(<PickingConfigForm />);
    expect(screen.getByText("off")).toBeInTheDocument();
    expect(screen.getByText("optional")).toBeInTheDocument();
    expect(screen.getByText("requiredFull")).toBeInTheDocument();
    expect(screen.getByText("requiredPartial")).toBeInTheDocument();
  });

  it("Given: config loaded When: rendering Then: should show mode descriptions", () => {
    render(<PickingConfigForm />);
    expect(screen.getByText("offDesc")).toBeInTheDocument();
    expect(screen.getByText("optionalDesc")).toBeInTheDocument();
    expect(screen.getByText("requiredFullDesc")).toBeInTheDocument();
    expect(screen.getByText("requiredPartialDesc")).toBeInTheDocument();
  });

  // ── Picking enabled state ───────────────────────────────────────────

  it("Given: picking is enabled When: rendering Then: the mode card should not have opacity class", () => {
    mockPickingState.pickingEnabled = true;
    const { container } = render(<PickingConfigForm />);
    const cards = container.querySelectorAll("[class*='opacity-50']");
    expect(cards.length).toBe(0);
  });

  it("Given: picking is disabled When: rendering Then: the mode card should have opacity-50 class", () => {
    mockPickingState.pickingEnabled = false;
    const { container } = render(<PickingConfigForm />);
    const cards = container.querySelectorAll("[class*='opacity-50']");
    expect(cards.length).toBe(1);
  });

  // ── Mode selection ──────────────────────────────────────────────────

  it("Given: picking is enabled and mode is OFF When: clicking OPTIONAL mode Then: should call setConfig with OPTIONAL", () => {
    mockPickingState.pickingEnabled = true;
    mockPickingState.config = { mode: "OFF" };
    render(<PickingConfigForm />);

    const optionalButton = screen.getByText("optional").closest("button");
    expect(optionalButton).not.toBeNull();
    fireEvent.click(optionalButton!);

    expect(mockPickingState.setConfig).toHaveBeenCalledWith({
      mode: "OPTIONAL",
    });
  });

  it("Given: picking is enabled When: clicking REQUIRED_FULL mode Then: should call setConfig with REQUIRED_FULL", () => {
    mockPickingState.pickingEnabled = true;
    render(<PickingConfigForm />);

    const button = screen.getByText("requiredFull").closest("button");
    fireEvent.click(button!);

    expect(mockPickingState.setConfig).toHaveBeenCalledWith({
      mode: "REQUIRED_FULL",
    });
  });

  it("Given: picking is enabled When: clicking REQUIRED_PARTIAL mode Then: should call setConfig with REQUIRED_PARTIAL", () => {
    mockPickingState.pickingEnabled = true;
    render(<PickingConfigForm />);

    const button = screen.getByText("requiredPartial").closest("button");
    fireEvent.click(button!);

    expect(mockPickingState.setConfig).toHaveBeenCalledWith({
      mode: "REQUIRED_PARTIAL",
    });
  });

  // ── Saving state ────────────────────────────────────────────────────

  it("Given: isSaving is true When: rendering Then: mode buttons should be disabled", () => {
    mockPickingState.isSaving = true;
    mockPickingState.pickingEnabled = true;
    render(<PickingConfigForm />);

    const buttons = screen
      .getAllByRole("button")
      .filter((b) => b.closest("[class*='rounded-lg border']"));
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  // ── Switch toggle ──────────────────────────────────────────────────

  it("Given: config loaded When: rendering Then: should render the switch checkbox element", () => {
    render(<PickingConfigForm />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
  });
});
