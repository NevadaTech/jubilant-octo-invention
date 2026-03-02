import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserAvatar } from "@/ui/components/user-avatar";

// --- Mocks ---

vi.mock("boring-avatars", () => ({
  __esModule: true,
  default: ({
    size,
    name,
    variant,
    colors,
  }: {
    size: number;
    name: string;
    variant: string;
    colors: string[];
  }) => (
    <svg
      data-testid="boring-avatar"
      data-size={size}
      data-name={name}
      data-variant={variant}
      data-colors={colors.join(",")}
    />
  ),
}));

// --- Tests ---

describe("UserAvatar", () => {
  it("Given: a name prop When: rendering Then: should render the boring-avatars Avatar with the name", () => {
    render(<UserAvatar name="John Doe" />);

    const avatar = screen.getByTestId("boring-avatar");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("data-name", "John Doe");
  });

  it("Given: no size prop When: rendering Then: should use the default size of 40", () => {
    render(<UserAvatar name="Jane" />);

    const avatar = screen.getByTestId("boring-avatar");
    expect(avatar).toHaveAttribute("data-size", "40");

    const wrapper = avatar.parentElement!;
    expect(wrapper.style.width).toBe("40px");
    expect(wrapper.style.height).toBe("40px");
  });

  it("Given: a custom size prop When: rendering Then: should pass the size to the Avatar and set wrapper dimensions", () => {
    render(<UserAvatar name="Jane" size={64} />);

    const avatar = screen.getByTestId("boring-avatar");
    expect(avatar).toHaveAttribute("data-size", "64");

    const wrapper = avatar.parentElement!;
    expect(wrapper.style.width).toBe("64px");
    expect(wrapper.style.height).toBe("64px");
  });

  it("Given: a className prop When: rendering Then: should apply the className to the wrapper div", () => {
    const { container } = render(
      <UserAvatar name="Test" className="rounded-full" />,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("rounded-full");
  });

  it("Given: the component When: rendering Then: should always use the marble variant", () => {
    render(<UserAvatar name="Alice" />);

    const avatar = screen.getByTestId("boring-avatar");
    expect(avatar).toHaveAttribute("data-variant", "marble");
  });

  it("Given: the component When: rendering Then: should pass the predefined color palette", () => {
    render(<UserAvatar name="Bob" />);

    const avatar = screen.getByTestId("boring-avatar");
    const colors = avatar.getAttribute("data-colors");
    expect(colors).toBe("#0ea5e9,#8b5cf6,#06b6d4,#f59e0b,#10b981");
  });

  it("Given: different names When: rendering Then: should pass the correct name for deterministic avatar generation", () => {
    const { rerender } = render(<UserAvatar name="user-a@example.com" />);

    let avatar = screen.getByTestId("boring-avatar");
    expect(avatar).toHaveAttribute("data-name", "user-a@example.com");

    rerender(<UserAvatar name="user-b@example.com" />);

    avatar = screen.getByTestId("boring-avatar");
    expect(avatar).toHaveAttribute("data-name", "user-b@example.com");
  });
});
