import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AlertConfigurationForm } from "@/modules/settings/presentation/components/alert-configuration-form";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const mockAlertConfig = {
  cronFrequency: "EVERY_DAY",
  notifyLowStock: true,
  notifyCriticalStock: true,
  notifyOutOfStock: true,
  recipientEmails: "admin@test.com",
  isEnabled: true,
  lastRunAt: null,
};

vi.mock("@/modules/settings/presentation/hooks", () => ({
  useAlertConfiguration: () => ({ data: mockAlertConfig, isLoading: false }),
  useUpdateAlertConfiguration: () => ({ isPending: false, mutate: vi.fn() }),
}));

describe("AlertConfigurationForm", () => {
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
    expect(screen.getByText("frequency")).toBeDefined();
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
});
