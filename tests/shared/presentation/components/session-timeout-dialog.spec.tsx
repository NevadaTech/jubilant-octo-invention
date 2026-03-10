import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SessionTimeoutDialog } from "@/shared/presentation/components/session-timeout-dialog";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    if (params) return `${key}:${JSON.stringify(params)}`;
    return key;
  },
}));

describe("SessionTimeoutDialog", () => {
  it("Given: open is true When: rendering Then: should display the dialog title", () => {
    // Arrange & Act
    render(
      <SessionTimeoutDialog
        open={true}
        remainingSeconds={120}
        onExtend={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByText("sessionTimeout.title")).toBeInTheDocument();
  });

  it("Given: open is true When: rendering Then: should display the description with time", () => {
    // Arrange & Act
    render(
      <SessionTimeoutDialog
        open={true}
        remainingSeconds={90}
        onExtend={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    // Assert — 90 seconds = "1:30"
    const description = screen.getByText(/sessionTimeout\.description/);
    expect(description).toBeInTheDocument();
    expect(description.textContent).toContain("1:30");
  });

  it("Given: remainingSeconds is less than 60 When: rendering Then: should display seconds format", () => {
    // Arrange & Act
    render(
      <SessionTimeoutDialog
        open={true}
        remainingSeconds={45}
        onExtend={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    // Assert — 45 seconds = "45s"
    const description = screen.getByText(/sessionTimeout\.description/);
    expect(description.textContent).toContain("45s");
  });

  it("Given: open is true When: rendering Then: should display logout and extend buttons", () => {
    // Arrange & Act
    render(
      <SessionTimeoutDialog
        open={true}
        remainingSeconds={60}
        onExtend={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByText("sessionTimeout.logout")).toBeInTheDocument();
    expect(screen.getByText("sessionTimeout.extend")).toBeInTheDocument();
  });

  it("Given: dialog is open When: logout button is clicked Then: onLogout should be called", () => {
    // Arrange
    const onLogout = vi.fn();
    render(
      <SessionTimeoutDialog
        open={true}
        remainingSeconds={60}
        onExtend={vi.fn()}
        onLogout={onLogout}
      />,
    );

    // Act
    fireEvent.click(screen.getByText("sessionTimeout.logout"));

    // Assert
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("Given: dialog is open When: extend button is clicked Then: onExtend should be called", () => {
    // Arrange
    const onExtend = vi.fn();
    render(
      <SessionTimeoutDialog
        open={true}
        remainingSeconds={60}
        onExtend={onExtend}
        onLogout={vi.fn()}
      />,
    );

    // Act
    fireEvent.click(screen.getByText("sessionTimeout.extend"));

    // Assert
    expect(onExtend).toHaveBeenCalledTimes(1);
  });

  it("Given: open is false When: rendering Then: should not display dialog content", () => {
    // Arrange & Act
    render(
      <SessionTimeoutDialog
        open={false}
        remainingSeconds={60}
        onExtend={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    // Assert
    expect(screen.queryByText("sessionTimeout.title")).not.toBeInTheDocument();
  });

  it("Given: remainingSeconds is exactly 60 When: rendering Then: should display 1:00 format", () => {
    // Arrange & Act
    render(
      <SessionTimeoutDialog
        open={true}
        remainingSeconds={60}
        onExtend={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    // Assert — 60 seconds = "1:00"
    const description = screen.getByText(/sessionTimeout\.description/);
    expect(description.textContent).toContain("1:00");
  });
});
