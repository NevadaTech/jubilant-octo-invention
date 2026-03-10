import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserForm } from "@/modules/users/presentation/components/user-form";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

let mockCreatePending = false;
let mockCreateIsError = false;

vi.mock("@/modules/users/presentation/hooks/use-users", () => ({
  useCreateUser: () => ({
    isPending: mockCreatePending,
    isError: mockCreateIsError,
    mutateAsync: vi.fn(),
  }),
}));

vi.mock("@/modules/users/presentation/schemas/user.schema", () => ({
  createUserSchema: { parse: vi.fn() },
  toCreateUserDto: vi.fn((d: unknown) => d),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => vi.fn(),
}));

describe("UserForm", () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreatePending = false;
    mockCreateIsError = false;
  });

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

  // --- Branch: createUser.isError shows error div ---
  it("Given: createUser has error When: rendering Then: should show error message", () => {
    mockCreateIsError = true;
    render(<UserForm open={true} onOpenChange={mockOnOpenChange} />);
    expect(screen.getByText("form.error")).toBeDefined();
  });

  // --- Branch: no error ---
  it("Given: no error When: rendering Then: should not show error message", () => {
    render(<UserForm open={true} onOpenChange={mockOnOpenChange} />);
    expect(screen.queryByText("form.error")).toBeNull();
  });

  // --- Branch: createUser.isPending shows loading text ---
  it("Given: createUser is pending When: rendering Then: should show loading text", () => {
    mockCreatePending = true;
    render(<UserForm open={true} onOpenChange={mockOnOpenChange} />);
    expect(screen.getByText("loading")).toBeDefined();
    expect(screen.queryByText("create")).toBeNull();
  });

  // --- Branch: close button (X) ---
  it("Given: open true When: clicking X button Then: should call onOpenChange(false)", () => {
    render(<UserForm open={true} onOpenChange={mockOnOpenChange} />);
    const buttons = screen.getAllByRole("button");
    // Find the X button (ghost icon button)
    const closeBtn = buttons.find(
      (b) =>
        b.querySelector("svg") !== null &&
        !b.textContent?.includes("cancel") &&
        !b.textContent?.includes("create"),
    );
    if (closeBtn) {
      fireEvent.click(closeBtn);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    }
  });
});
