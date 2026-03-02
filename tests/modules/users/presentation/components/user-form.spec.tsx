import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserForm } from "@/modules/users/presentation/components/user-form";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/modules/users/presentation/hooks/use-users", () => ({
  useCreateUser: () => ({
    isPending: false,
    isError: false,
    mutateAsync: vi.fn(),
  }),
}));

describe("UserForm", () => {
  const mockOnOpenChange = vi.fn();

  it("Given: open false When: rendering Then: should return null", () => {
    const { container } = render(
      <UserForm open={false} onOpenChange={mockOnOpenChange} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("Given: open true When: rendering Then: should show create title", () => {
    render(<UserForm open={true} onOpenChange={mockOnOpenChange} />);
    expect(screen.getByText("form.createTitle")).toBeDefined();
  });

  it("Given: open true When: rendering Then: should show name fields", () => {
    render(<UserForm open={true} onOpenChange={mockOnOpenChange} />);
    expect(screen.getByPlaceholderText("John")).toBeDefined();
    expect(screen.getByPlaceholderText("Doe")).toBeDefined();
  });

  it("Given: open true When: rendering Then: should show email, username, and password fields", () => {
    render(<UserForm open={true} onOpenChange={mockOnOpenChange} />);
    expect(screen.getByPlaceholderText("john@example.com")).toBeDefined();
    expect(screen.getByPlaceholderText("johndoe")).toBeDefined();
    expect(screen.getByPlaceholderText("********")).toBeDefined();
  });

  it("Given: open true When: rendering Then: should show cancel and create buttons", () => {
    render(<UserForm open={true} onOpenChange={mockOnOpenChange} />);
    expect(screen.getByText("cancel")).toBeDefined();
    expect(screen.getByText("create")).toBeDefined();
  });

  it("Given: open true When: clicking cancel Then: should call onOpenChange(false)", () => {
    render(<UserForm open={true} onOpenChange={mockOnOpenChange} />);
    fireEvent.click(screen.getByText("cancel"));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
