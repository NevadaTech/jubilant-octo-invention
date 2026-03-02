import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RoleForm } from "@/modules/roles/presentation/components/role-form";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/modules/roles/presentation/hooks/use-roles", () => ({
  useCreateRole: () => ({
    isPending: false,
    isError: false,
    mutateAsync: vi.fn(),
  }),
}));

describe("RoleForm", () => {
  const mockOnOpenChange = vi.fn();

  it("Given: open false When: rendering Then: should return null", () => {
    const { container } = render(
      <RoleForm open={false} onOpenChange={mockOnOpenChange} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("Given: open true When: rendering Then: should show create title", () => {
    render(<RoleForm open={true} onOpenChange={mockOnOpenChange} />);
    expect(screen.getByText("form.createTitle")).toBeDefined();
  });

  it("Given: open true When: rendering Then: should show name and description fields", () => {
    render(<RoleForm open={true} onOpenChange={mockOnOpenChange} />);
    expect(screen.getByPlaceholderText("fields.namePlaceholder")).toBeDefined();
    expect(
      screen.getByPlaceholderText("fields.descriptionPlaceholder"),
    ).toBeDefined();
  });

  it("Given: open true When: rendering Then: should show cancel and create buttons", () => {
    render(<RoleForm open={true} onOpenChange={mockOnOpenChange} />);
    expect(screen.getByText("cancel")).toBeDefined();
    expect(screen.getByText("create")).toBeDefined();
  });

  it("Given: open true When: clicking close button Then: should call onOpenChange(false)", () => {
    render(<RoleForm open={true} onOpenChange={mockOnOpenChange} />);
    fireEvent.click(screen.getByText("cancel"));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
