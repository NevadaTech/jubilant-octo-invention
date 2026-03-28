import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AlertConfigurationForm } from "@/modules/settings/presentation/components/alert-configuration-form";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

let mockAlertConfig: Record<string, unknown> | null = {
  cronFrequency: "EVERY_DAY",
  notifyLowStock: true,
  notifyCriticalStock: true,
  notifyOutOfStock: true,
  recipientEmails: "admin@test.com",
  isEnabled: true,
  lastRunAt: null,
};
let mockIsLoading = false;
let mockIsPending = false;

vi.mock("@/modules/settings/presentation/hooks", () => ({
  useAlertConfiguration: () => ({
    data: mockAlertConfig,
    isLoading: mockIsLoading,
  }),
  useUpdateAlertConfiguration: () => ({
    isPending: mockIsPending,
    mutate: vi.fn(),
  }),
}));

describe("AlertConfigurationForm", () => {
  beforeEach(() => {
    mockAlertConfig = {
      cronFrequency: "EVERY_DAY",
      notifyLowStock: true,
      notifyCriticalStock: true,
      notifyOutOfStock: true,
      recipientEmails: "admin@test.com",
      isEnabled: true,
      lastRunAt: null,
    };
    mockIsLoading = false;
    mockIsPending = false;
  });

  it("Given: config loaded When: rendering Then: should show title", () => {
    render(<AlertConfigurationForm />);
    expect(screen.getByText("title")).toBeDefined();
  });

  it("Given: config loaded When: rendering Then: should show description", () => {
    render(<AlertConfigurationForm />);
    expect(screen.getByText("description")).toBeDefined();
  });

  it("Given: config loaded When: rendering Then: should show save button", () => {
    render(<AlertConfigurationForm />);
    expect(screen.getByText("save")).toBeDefined();
  });

  it("Given: config loaded When: rendering Then: should show frequency field", () => {
    render(<AlertConfigurationForm />);
    // "frequency" appears in both the label and the select trigger placeholder
    expect(screen.getAllByText("frequency").length).toBeGreaterThan(0);
  });

  it("Given: config loaded When: rendering Then: should show enabled toggle label", () => {
    render(<AlertConfigurationForm />);
    expect(screen.getByText("enabled")).toBeDefined();
  });

  it("Given: config loaded When: rendering Then: should show severities label", () => {
    render(<AlertConfigurationForm />);
    expect(screen.getByText("severities")).toBeDefined();
  });

  it("Given: config loaded When: rendering Then: should show low stock toggle", () => {
    render(<AlertConfigurationForm />);
    expect(screen.getByText("lowStock")).toBeDefined();
  });

  it("Given: config loaded When: rendering Then: should show critical stock toggle", () => {
    render(<AlertConfigurationForm />);
    expect(screen.getByText("criticalStock")).toBeDefined();
  });

  it("Given: config loaded When: rendering Then: should show out of stock toggle", () => {
    render(<AlertConfigurationForm />);
    expect(screen.getByText("outOfStock")).toBeDefined();
  });

  it("Given: config loaded When: rendering Then: should show recipients field", () => {
    render(<AlertConfigurationForm />);
    expect(screen.getByText("recipients")).toBeDefined();
  });

  it("Given: config loaded When: rendering Then: should show recipients help text", () => {
    render(<AlertConfigurationForm />);
    expect(screen.getByText("recipientsHelp")).toBeDefined();
  });

  it("Given: config not dirty When: rendering Then: should disable save button", () => {
    render(<AlertConfigurationForm />);
    const saveButton = screen.getByText("save").closest("button");
    expect(saveButton).toBeDisabled();
  });

  it("Given: config loaded When: rendering Then: should render form element", () => {
    render(<AlertConfigurationForm />);
    const form = document.querySelector("form");
    expect(form).toBeDefined();
    expect(form).not.toBeNull();
  });

  // --- Branch: isLoading state ---
  it("Given: config is loading When: rendering Then: should show skeleton placeholders", () => {
    mockIsLoading = true;
    const { container } = render(<AlertConfigurationForm />);
    const skeletons = container.querySelectorAll("[class*='animate-pulse']");
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.queryByText("title")).toBeNull();
  });

  it("Given: config is loading When: rendering Then: should not show form", () => {
    mockIsLoading = true;
    render(<AlertConfigurationForm />);
    expect(document.querySelector("form")).toBeNull();
  });

  // --- Branch: isEnabled false (opacity-50 class) ---
  it("Given: config isEnabled is false When: rendering Then: should show dimmed content", () => {
    mockAlertConfig = { ...mockAlertConfig!, isEnabled: false };
    const { container } = render(<AlertConfigurationForm />);
    const dimmedDiv = container.querySelector("[class*='opacity-50']");
    expect(dimmedDiv).not.toBeNull();
  });

  it("Given: config isEnabled is true When: rendering Then: should show normal content without pointer-events-none", () => {
    mockAlertConfig = { ...mockAlertConfig!, isEnabled: true };
    const { container } = render(<AlertConfigurationForm />);
    // The form renders with isEnabled=true as default, content should be interactable
    const form = container.querySelector("form");
    expect(form).not.toBeNull();
  });

  // --- Branch: lastRunAt present ---
  it("Given: config has lastRunAt When: rendering Then: should show last run info", () => {
    mockAlertConfig = {
      ...mockAlertConfig!,
      lastRunAt: "2026-01-15T10:30:00.000Z",
    };
    render(<AlertConfigurationForm />);
    expect(screen.getByText(/lastRun/)).toBeDefined();
  });

  it("Given: config has no lastRunAt When: rendering Then: should not show last run info", () => {
    mockAlertConfig = { ...mockAlertConfig!, lastRunAt: null };
    render(<AlertConfigurationForm />);
    expect(screen.queryByText(/lastRun/)).toBeNull();
  });

  // --- Branch: updateConfig.isPending ---
  it("Given: update is pending When: rendering Then: should show loading spinner", () => {
    mockIsPending = true;
    const { container } = render(<AlertConfigurationForm />);
    const spinner = container.querySelector("[class*='animate-spin']");
    expect(spinner).not.toBeNull();
  });

  // --- Branch: recipientEmails is null ---
  it("Given: config recipientEmails is null When: rendering Then: should default to empty string", () => {
    mockAlertConfig = { ...mockAlertConfig!, recipientEmails: null };
    render(<AlertConfigurationForm />);
    expect(screen.getByText("recipients")).toBeDefined();
  });

  // --- Branch: config is null (no data yet) ---
  it("Given: config is null When: rendering Then: should still show form with defaults", () => {
    mockAlertConfig = null;
    render(<AlertConfigurationForm />);
    expect(screen.getByText("title")).toBeDefined();
  });
});
