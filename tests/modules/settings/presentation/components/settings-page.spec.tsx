import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsPage } from "@/modules/settings/presentation/components/settings-page";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/modules/settings/presentation/components/profile-form", () => ({
  ProfileForm: () => <div data-testid="profile-form">ProfileForm</div>,
}));

vi.mock(
  "@/modules/settings/presentation/components/change-password-form",
  () => ({
    ChangePasswordForm: () => (
      <div data-testid="change-password-form">ChangePasswordForm</div>
    ),
  }),
);

vi.mock(
  "@/modules/settings/presentation/components/alert-configuration-form",
  () => ({
    AlertConfigurationForm: () => (
      <div data-testid="alert-config-form">AlertConfigurationForm</div>
    ),
  }),
);

vi.mock(
  "@/modules/settings/presentation/components/multi-company-toggle",
  () => ({
    MultiCompanyToggle: () => (
      <div data-testid="multi-company-toggle">MultiCompanyToggle</div>
    ),
  }),
);

vi.mock(
  "@/modules/settings/presentation/components/integrations-toggle",
  () => ({
    IntegrationsToggle: () => (
      <div data-testid="integrations-toggle">IntegrationsToggle</div>
    ),
  }),
);

vi.mock(
  "@/modules/settings/presentation/components/picking-config-form",
  () => ({
    PickingConfigForm: () => (
      <div data-testid="picking-config-form">PickingConfigForm</div>
    ),
  }),
);

vi.mock("@/modules/companies/presentation/components", () => ({
  CompanyList: () => <div data-testid="company-list">CompanyList</div>,
}));

let mockHasPermission = true;

vi.mock("@/modules/authentication/presentation/hooks/use-permissions", () => ({
  usePermissions: () => ({
    hasPermission: () => mockHasPermission,
    hasAnyPermission: () => mockHasPermission,
    hasAllPermissions: () => mockHasPermission,
  }),
}));

let mockMultiCompanyEnabled = false;
let mockIntegrationsEnabled = false;

vi.mock("@/shared/presentation/hooks/use-org-settings", () => ({
  useOrgSettings: () => ({
    multiCompanyEnabled: mockMultiCompanyEnabled,
    integrationsEnabled: mockIntegrationsEnabled,
  }),
}));

// --- Tests ---

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasPermission = true;
    mockMultiCompanyEnabled = false;
    mockIntegrationsEnabled = false;
  });

  // --- Title and description ---

  it("Given: page renders When: viewing settings Then: should show title as h1", () => {
    render(<SettingsPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("title");
  });

  it("Given: page renders When: viewing settings Then: should show description", () => {
    render(<SettingsPage />);
    expect(screen.getByText("description")).toBeInTheDocument();
  });

  // --- Tabs rendering ---

  it("Given: page renders When: viewing settings Then: should show all 4 tabs", () => {
    render(<SettingsPage />);
    expect(
      screen.getByRole("tab", { name: "tabs.account" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "tabs.notifications" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "tabs.picking" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "tabs.organization" }),
    ).toBeInTheDocument();
  });

  // --- Account tab (default) ---

  it("Given: default tab When: rendering Then: should show ProfileForm and ChangePasswordForm", () => {
    render(<SettingsPage />);
    expect(screen.getByTestId("profile-form")).toBeInTheDocument();
    expect(screen.getByTestId("change-password-form")).toBeInTheDocument();
  });

  // --- Notifications tab ---

  it("Given: SETTINGS_MANAGE permission When: clicking notifications tab Then: should show AlertConfigurationForm", () => {
    mockHasPermission = true;
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole("tab", { name: "tabs.notifications" }));
    expect(screen.getByTestId("alert-config-form")).toBeInTheDocument();
  });

  it("Given: no SETTINGS_MANAGE permission When: clicking notifications tab Then: should NOT show AlertConfigurationForm", () => {
    mockHasPermission = false;
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole("tab", { name: "tabs.notifications" }));
    expect(screen.queryByTestId("alert-config-form")).not.toBeInTheDocument();
  });

  // --- Picking tab ---

  it("Given: SETTINGS_MANAGE permission When: clicking picking tab Then: should show PickingConfigForm", () => {
    mockHasPermission = true;
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole("tab", { name: "tabs.picking" }));
    expect(screen.getByTestId("picking-config-form")).toBeInTheDocument();
  });

  it("Given: no SETTINGS_MANAGE permission When: clicking picking tab Then: should NOT show PickingConfigForm", () => {
    mockHasPermission = false;
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole("tab", { name: "tabs.picking" }));
    expect(screen.queryByTestId("picking-config-form")).not.toBeInTheDocument();
  });

  // --- Organization tab: MultiCompanyToggle always shown (with permission) ---

  it("Given: SETTINGS_MANAGE permission When: clicking organization tab Then: should show MultiCompanyToggle", () => {
    mockHasPermission = true;
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole("tab", { name: "tabs.organization" }));
    expect(screen.getByTestId("multi-company-toggle")).toBeInTheDocument();
  });

  it("Given: no SETTINGS_MANAGE permission When: clicking organization tab Then: should NOT show MultiCompanyToggle", () => {
    mockHasPermission = false;
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole("tab", { name: "tabs.organization" }));
    expect(
      screen.queryByTestId("multi-company-toggle"),
    ).not.toBeInTheDocument();
  });

  // --- Organization tab: integrationsEnabled conditional ---

  it("Given: integrationsEnabled is true and permission When: clicking organization tab Then: should show IntegrationsToggle", () => {
    mockHasPermission = true;
    mockIntegrationsEnabled = true;
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole("tab", { name: "tabs.organization" }));
    expect(screen.getByTestId("integrations-toggle")).toBeInTheDocument();
  });

  it("Given: integrationsEnabled is false When: clicking organization tab Then: should NOT show IntegrationsToggle", () => {
    mockHasPermission = true;
    mockIntegrationsEnabled = false;
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole("tab", { name: "tabs.organization" }));
    expect(screen.queryByTestId("integrations-toggle")).not.toBeInTheDocument();
  });

  it("Given: integrationsEnabled is true but no permission When: clicking organization tab Then: should NOT show IntegrationsToggle", () => {
    mockHasPermission = false;
    mockIntegrationsEnabled = true;
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole("tab", { name: "tabs.organization" }));
    expect(screen.queryByTestId("integrations-toggle")).not.toBeInTheDocument();
  });

  // --- Organization tab: multiCompanyEnabled conditional ---

  it("Given: multiCompanyEnabled is true and permission When: clicking organization tab Then: should show CompanyList", () => {
    mockHasPermission = true;
    mockMultiCompanyEnabled = true;
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole("tab", { name: "tabs.organization" }));
    expect(screen.getByTestId("company-list")).toBeInTheDocument();
  });

  it("Given: multiCompanyEnabled is false When: clicking organization tab Then: should NOT show CompanyList", () => {
    mockHasPermission = true;
    mockMultiCompanyEnabled = false;
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole("tab", { name: "tabs.organization" }));
    expect(screen.queryByTestId("company-list")).not.toBeInTheDocument();
  });

  it("Given: multiCompanyEnabled is true but no permission When: clicking organization tab Then: should NOT show CompanyList", () => {
    mockHasPermission = false;
    mockMultiCompanyEnabled = true;
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole("tab", { name: "tabs.organization" }));
    expect(screen.queryByTestId("company-list")).not.toBeInTheDocument();
  });

  // --- Both flags enabled ---

  it("Given: both integrationsEnabled and multiCompanyEnabled When: clicking organization tab Then: should show all components", () => {
    mockHasPermission = true;
    mockIntegrationsEnabled = true;
    mockMultiCompanyEnabled = true;
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole("tab", { name: "tabs.organization" }));
    expect(screen.getByTestId("integrations-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("multi-company-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("company-list")).toBeInTheDocument();
  });
});
