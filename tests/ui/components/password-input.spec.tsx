import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasswordInput } from "@/ui/components/password-input";

describe("PasswordInput", () => {
  it("Given: default state When: rendering Then: input type should be password", () => {
    // Arrange & Act
    render(<PasswordInput placeholder="Enter password" />);

    // Assert
    const input = screen.getByPlaceholderText("Enter password");
    expect(input).toHaveAttribute("type", "password");
  });

  it("Given: default state When: rendering Then: toggle button should have 'Show password' label", () => {
    // Arrange & Act
    render(<PasswordInput />);

    // Assert
    expect(screen.getByLabelText("Show password")).toBeInTheDocument();
  });

  it("Given: password is hidden When: toggle button is clicked Then: input type should change to text", () => {
    // Arrange
    render(<PasswordInput placeholder="Enter password" />);

    // Act
    fireEvent.click(screen.getByLabelText("Show password"));

    // Assert
    const input = screen.getByPlaceholderText("Enter password");
    expect(input).toHaveAttribute("type", "text");
  });

  it("Given: password is visible When: toggle button is clicked Then: input type should change back to password", () => {
    // Arrange
    render(<PasswordInput placeholder="Enter password" />);
    const toggleBtn = screen.getByLabelText("Show password");

    // Act — show, then hide
    fireEvent.click(toggleBtn);
    fireEvent.click(screen.getByLabelText("Hide password"));

    // Assert
    const input = screen.getByPlaceholderText("Enter password");
    expect(input).toHaveAttribute("type", "password");
  });

  it("Given: password is visible When: rendering Then: toggle button should have 'Hide password' label", () => {
    // Arrange
    render(<PasswordInput />);

    // Act
    fireEvent.click(screen.getByLabelText("Show password"));

    // Assert
    expect(screen.getByLabelText("Hide password")).toBeInTheDocument();
  });

  it("Given: a custom className When: rendering Then: should apply it to the input", () => {
    // Arrange & Act
    const { container } = render(<PasswordInput className="my-custom-class" />);

    // Assert
    const input = container.querySelector("input");
    expect(input?.className).toContain("my-custom-class");
  });

  it("Given: disabled prop When: rendering Then: input should be disabled", () => {
    // Arrange & Act
    render(<PasswordInput placeholder="Enter password" disabled />);

    // Assert
    const input = screen.getByPlaceholderText("Enter password");
    expect(input).toBeDisabled();
  });

  it("Given: onChange handler When: user types Then: handler should be called", () => {
    // Arrange
    const onChange = vi.fn();
    render(<PasswordInput placeholder="Enter password" onChange={onChange} />);

    // Act
    fireEvent.change(screen.getByPlaceholderText("Enter password"), {
      target: { value: "secret" },
    });

    // Assert
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
