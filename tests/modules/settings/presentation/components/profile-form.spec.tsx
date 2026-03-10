import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProfileForm } from "@/modules/settings/presentation/components/profile-form";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string) => key;
    t.has = (key: string) => key !== "names.CUSTOM_ROLE";
    return t;
  },
}));

vi.mock("@/ui/components/user-avatar", () => ({
  UserAvatar: ({ name }: { name: string }) => (
    <div data-testid="user-avatar">{name}</div>
  ),
}));

vi.mock("@/ui/components/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

vi.mock("@/ui/components/badge", () => ({
  Badge: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant?: string;
  }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

vi.mock("@/ui/components/form-field", () => ({
  FormField: ({
    children,
    error,
  }: {
    children: React.ReactNode;
    error?: string;
  }) => (
    <div data-testid="form-field">
      {children}
      {error && <span data-testid="field-error">{error}</span>}
    </div>
  ),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => vi.fn(),
}));

vi.mock("@/modules/settings/presentation/schemas", () => ({
  profileSchema: {},
}));

let mockProfileData: Record<string, unknown> | undefined = undefined;
let mockIsLoading = false;
let mockIsPending = false;
const mockMutate = vi.fn();

vi.mock("@/modules/settings/presentation/hooks", () => ({
  useProfile: () => ({ data: mockProfileData, isLoading: mockIsLoading }),
  useUpdateProfile: () => ({ isPending: mockIsPending, mutate: mockMutate }),
}));

// --- Tests ---

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
    mockIsPending = false;
    mockProfileData = {
      email: "john@test.com",
      username: "johndoe",
      firstName: "John",
      lastName: "Doe",
      phone: "555-1234",
      timezone: "UTC",
      language: "en",
      jobTitle: "Developer",
      department: "Engineering",
      roles: ["ADMIN"],
    };
  });

  // --- Loading state ---

  it("Given: profile is loading When: rendering Then: should show skeleton placeholders", () => {
    mockIsLoading = true;
    mockProfileData = undefined;

    render(<ProfileForm />);

    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.queryByText("title")).not.toBeInTheDocument();
  });

  it("Given: profile is loading When: rendering Then: should NOT show any form fields", () => {
    mockIsLoading = true;
    mockProfileData = undefined;

    render(<ProfileForm />);

    expect(screen.queryByText("firstName")).not.toBeInTheDocument();
    expect(screen.queryByText("saveChanges")).not.toBeInTheDocument();
  });

  // --- Loaded state: basic rendering ---

  it("Given: profile loaded When: rendering Then: should show title and description", () => {
    render(<ProfileForm />);
    expect(screen.getByText("title")).toBeInTheDocument();
    expect(screen.getByText("description")).toBeInTheDocument();
  });

  it("Given: profile loaded When: rendering Then: should show all form fields", () => {
    render(<ProfileForm />);
    expect(screen.getAllByText("firstName").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("lastName").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("phone").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("jobTitle").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("department").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("timezone").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("language").length).toBeGreaterThanOrEqual(1);
  });

  it("Given: profile loaded When: rendering Then: should show user email", () => {
    render(<ProfileForm />);
    expect(screen.getAllByText("john@test.com").length).toBeGreaterThanOrEqual(
      1,
    );
  });

  it("Given: profile loaded When: rendering Then: should show username with @ prefix", () => {
    render(<ProfileForm />);
    expect(screen.getByText("@johndoe")).toBeInTheDocument();
  });

  it("Given: profile loaded When: rendering Then: should show user avatar", () => {
    render(<ProfileForm />);
    expect(screen.getByTestId("user-avatar")).toBeInTheDocument();
  });

  it("Given: profile loaded When: rendering Then: should show save button", () => {
    render(<ProfileForm />);
    expect(screen.getByText("saveChanges")).toBeInTheDocument();
  });

  // --- Roles display ---

  it("Given: profile has roles When: rendering Then: should show role badges", () => {
    render(<ProfileForm />);
    expect(screen.getByText(/role/)).toBeInTheDocument();
    const badges = screen.getAllByTestId("badge");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("Given: profile has translated role name When: rendering Then: should show translated name", () => {
    // "ADMIN" → t.has("names.ADMIN") returns true → t("names.ADMIN") = "names.ADMIN"
    render(<ProfileForm />);
    expect(screen.getByText("names.ADMIN")).toBeInTheDocument();
  });

  it("Given: profile has untranslated role name When: rendering Then: should show raw role name", () => {
    mockProfileData = {
      ...mockProfileData,
      roles: ["CUSTOM_ROLE"],
    };

    render(<ProfileForm />);
    // t.has("names.CUSTOM_ROLE") returns false → uses raw "CUSTOM_ROLE"
    expect(screen.getByText("CUSTOM_ROLE")).toBeInTheDocument();
  });

  it("Given: profile has multiple roles When: rendering Then: should show all role badges", () => {
    mockProfileData = {
      ...mockProfileData,
      roles: ["ADMIN", "CUSTOM_ROLE"],
    };

    render(<ProfileForm />);
    const badges = screen.getAllByTestId("badge");
    expect(badges.length).toBe(2);
  });

  it("Given: profile has empty roles array When: rendering Then: should NOT show role section", () => {
    mockProfileData = {
      ...mockProfileData,
      roles: [],
    };

    render(<ProfileForm />);
    expect(screen.queryByTestId("badge")).not.toBeInTheDocument();
  });

  it("Given: profile has no roles property When: rendering Then: should NOT show role section", () => {
    mockProfileData = {
      email: "john@test.com",
      username: "johndoe",
      firstName: "John",
      lastName: "Doe",
      phone: "555-1234",
      timezone: "UTC",
      language: "en",
      jobTitle: "Developer",
      department: "Engineering",
    };

    render(<ProfileForm />);
    expect(screen.queryByTestId("badge")).not.toBeInTheDocument();
  });

  // --- Save button disabled state ---

  it("Given: form not dirty When: rendering Then: save button should be disabled", () => {
    render(<ProfileForm />);
    const saveButton = screen.getByText("saveChanges").closest("button");
    expect(saveButton).toBeDisabled();
  });

  // --- isPending state ---

  it("Given: updateProfile isPending When: rendering Then: save button should be disabled", () => {
    mockIsPending = true;

    render(<ProfileForm />);
    const saveButton = screen.getByText("saveChanges").closest("button");
    expect(saveButton).toBeDisabled();
  });

  // --- Profile with null optional fields ---

  it("Given: profile with null phone/jobTitle/department When: rendering Then: should render form without errors", () => {
    mockProfileData = {
      email: "john@test.com",
      username: "johndoe",
      firstName: "John",
      lastName: "Doe",
      phone: null,
      timezone: null,
      language: null,
      jobTitle: null,
      department: null,
      roles: ["ADMIN"],
    };

    expect(() => render(<ProfileForm />)).not.toThrow();
    expect(screen.getByText("title")).toBeInTheDocument();
  });

  // --- Profile email in avatar ---

  it("Given: profile loaded When: rendering Then: should pass email to UserAvatar", () => {
    render(<ProfileForm />);
    const avatar = screen.getByTestId("user-avatar");
    expect(avatar.textContent).toBe("john@test.com");
  });

  it("Given: profile is undefined (no email) When: rendering loaded form Then: avatar should use empty string", () => {
    mockProfileData = undefined;
    mockIsLoading = false;

    render(<ProfileForm />);
    // When profile is undefined, profile?.email ?? "" = ""
    const avatar = screen.getByTestId("user-avatar");
    expect(avatar.textContent).toBe("");
  });
});
