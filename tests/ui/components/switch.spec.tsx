import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Switch } from "@/ui/components/switch";

describe("Switch", () => {
  it("Given: checked is false When: rendering Then: the checkbox should be unchecked", () => {
    // Arrange & Act
    render(<Switch checked={false} aria-label="Toggle" />);

    // Assert
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("Given: checked is true When: rendering Then: the checkbox should be checked", () => {
    // Arrange & Act
    render(<Switch checked={true} aria-label="Toggle" />);

    // Assert
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("Given: switch is unchecked When: clicked Then: onCheckedChange should be called with true", () => {
    // Arrange
    const onCheckedChange = vi.fn();
    render(
      <Switch
        checked={false}
        onCheckedChange={onCheckedChange}
        aria-label="Toggle"
      />,
    );

    // Act
    fireEvent.click(screen.getByRole("checkbox"));

    // Assert
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("Given: switch is checked When: clicked Then: onCheckedChange should be called with false", () => {
    // Arrange
    const onCheckedChange = vi.fn();
    render(
      <Switch
        checked={true}
        onCheckedChange={onCheckedChange}
        aria-label="Toggle"
      />,
    );

    // Act
    fireEvent.click(screen.getByRole("checkbox"));

    // Assert
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it("Given: disabled is true When: rendering Then: the checkbox should be disabled", () => {
    // Arrange & Act
    render(<Switch checked={false} disabled aria-label="Toggle" />);

    // Assert
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  it("Given: disabled is true When: rendering Then: the label should have opacity-50 class", () => {
    // Arrange & Act
    const { container } = render(
      <Switch checked={false} disabled aria-label="Toggle" />,
    );

    // Assert
    const label = container.querySelector("label");
    expect(label?.className).toContain("opacity-50");
    expect(label?.className).toContain("cursor-not-allowed");
  });

  it("Given: a custom className When: rendering Then: should apply it to the label wrapper", () => {
    // Arrange & Act
    const { container } = render(
      <Switch checked={false} className="my-switch" aria-label="Toggle" />,
    );

    // Assert
    const label = container.querySelector("label");
    expect(label?.className).toContain("my-switch");
  });

  it("Given: checked changes When: rendering Then: thumb position class should reflect checked state", () => {
    // Arrange
    const { container, rerender } = render(
      <Switch checked={false} aria-label="Toggle" />,
    );

    // Assert unchecked thumb — the thumb span (not sr-only)
    const thumbs = container.querySelectorAll("span");
    // Last span is the thumb (first is sr-only "Close" if any)
    const thumb = Array.from(thumbs).find(
      (s) => !s.classList.contains("sr-only"),
    ) as HTMLElement;
    expect(thumb.className).toContain("translate-x-0");

    // Act
    rerender(<Switch checked={true} aria-label="Toggle" />);

    // Assert checked thumb
    expect(thumb.className).toContain("translate-x-5");
  });

  it("Given: no onCheckedChange provided When: clicked Then: should not throw an error", () => {
    // Arrange & Act
    render(<Switch checked={false} aria-label="Toggle" />);

    // Assert — should not throw
    expect(() => {
      fireEvent.click(screen.getByRole("checkbox"));
    }).not.toThrow();
  });
});
