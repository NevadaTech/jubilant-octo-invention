import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfileForm } from "@/modules/settings/presentation/components/profile-form";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/ui/components/user-avatar", () => ({
  UserAvatar: ({ name }: { name: string }) => (
    <div data-testid="user-avatar">{name}</div>
  ),
}));

const mockProfile = {
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

vi.mock("@/modules/settings/presentation/hooks", () => ({
  useProfile: () => ({ data: mockProfile, isLoading: false }),
  useUpdateProfile: () => ({ isPending: false, mutate: vi.fn() }),
}));

describe("ProfileForm", () => {
  it("Given: profile loaded When: rendering Then: should show title", () => {
    render(<ProfileForm />);
    expect(screen.getByText("title")).toBeDefined();
  });

  it("Given: profile loaded When: rendering Then: should show description", () => {
    render(<ProfileForm />);
    expect(screen.getByText("description")).toBeDefined();
  });

  it("Given: profile loaded When: rendering Then: should show first name field", () => {
    render(<ProfileForm />);
    expect(screen.getByText("firstName")).toBeDefined();
  });

  it("Given: profile loaded When: rendering Then: should show last name field", () => {
    render(<ProfileForm />);
    expect(screen.getByText("lastName")).toBeDefined();
  });

  it("Given: profile loaded When: rendering Then: should show save button", () => {
    render(<ProfileForm />);
    expect(screen.getByText("saveChanges")).toBeDefined();
  });

  it("Given: profile loaded When: rendering Then: should show user email", () => {
    render(<ProfileForm />);
    expect(screen.getAllByText("john@test.com").length).toBeGreaterThanOrEqual(
      1,
    );
  });

  it("Given: profile loaded When: rendering Then: should show username", () => {
    render(<ProfileForm />);
    expect(screen.getByText("@johndoe")).toBeDefined();
  });

  it("Given: profile loaded When: rendering Then: should show phone field", () => {
    render(<ProfileForm />);
    expect(screen.getByText("phone")).toBeDefined();
  });

  it("Given: profile loaded When: rendering Then: should show job title field", () => {
    render(<ProfileForm />);
    expect(screen.getByText("jobTitle")).toBeDefined();
  });

  it("Given: profile loaded When: rendering Then: should show department field", () => {
    render(<ProfileForm />);
    expect(screen.getByText("department")).toBeDefined();
  });

  it("Given: profile loaded When: rendering Then: should show timezone field", () => {
    render(<ProfileForm />);
    expect(screen.getByText("timezone")).toBeDefined();
  });

  it("Given: profile loaded When: rendering Then: should show language field", () => {
    render(<ProfileForm />);
    expect(screen.getByText("language")).toBeDefined();
  });

  it("Given: profile loaded When: rendering Then: should show user avatar", () => {
    render(<ProfileForm />);
    expect(screen.getByTestId("user-avatar")).toBeDefined();
  });

  it("Given: profile loaded When: rendering Then: should show role badge", () => {
    render(<ProfileForm />);
    expect(screen.getByText("ADMIN")).toBeDefined();
  });

  it("Given: profile loaded When: rendering Then: should show role label", () => {
    render(<ProfileForm />);
    expect(screen.getByText(/role/)).toBeDefined();
  });

  it("Given: profile not dirty When: rendering Then: should disable save button", () => {
    render(<ProfileForm />);
    const saveButton = screen.getByText("saveChanges").closest("button");
    expect(saveButton).toBeDisabled();
  });
});
