import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SettingsPage } from "@/modules/settings/presentation/components/settings-page";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/modules/settings/presentation/components/profile-form", () => ({
  ProfileForm: () => <div data-testid="profile-form">ProfileForm</div>,
}));

vi.mock(
  "@/modules/settings/presentation/components/alert-configuration-form",
  () => ({
    AlertConfigurationForm: () => (
      <div data-testid="alert-config-form">AlertConfigurationForm</div>
    ),
  }),
);

let mockHasPermission = true;

vi.mock("@/modules/authentication/presentation/hooks/use-permissions", () => ({
  usePermissions: () => ({
    hasPermission: () => mockHasPermission,
    hasAnyPermission: () => mockHasPermission,
    hasAllPermissions: () => mockHasPermission,
  }),
}));

describe("SettingsPage", () => {
  it("Given: page renders When: viewing settings Then: should show the page title", () => {
    render(<SettingsPage />);
    expect(screen.getByText("title")).toBeInTheDocument();
  });

  it("Given: page renders When: viewing settings Then: should show the page description", () => {
    render(<SettingsPage />);
    expect(screen.getByText("description")).toBeInTheDocument();
  });

  it("Given: page renders When: viewing settings Then: should render the ProfileForm component", () => {
    render(<SettingsPage />);
    expect(screen.getByTestId("profile-form")).toBeInTheDocument();
  });

  it("Given: user has SETTINGS_MANAGE permission When: rendering Then: should render the AlertConfigurationForm", () => {
    mockHasPermission = true;
    render(<SettingsPage />);
    expect(screen.getByTestId("alert-config-form")).toBeInTheDocument();
  });

  it("Given: user lacks SETTINGS_MANAGE permission When: rendering Then: should not render the AlertConfigurationForm", () => {
    mockHasPermission = false;
    render(<SettingsPage />);
    expect(screen.queryByTestId("alert-config-form")).not.toBeInTheDocument();
  });

  it("Given: page renders When: viewing settings Then: should show title in an h1 heading element", () => {
    render(<SettingsPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe("title");
  });
});
