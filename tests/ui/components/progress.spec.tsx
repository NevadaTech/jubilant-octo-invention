import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Progress } from "@/ui/components/progress";

describe("Progress", () => {
  it("Given: a value of 50 When: rendering Then: should render a progressbar with correct aria attributes", () => {
    // Arrange & Act
    render(<Progress value={50} />);

    // Assert
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute("aria-valuenow", "50");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });

  it("Given: a value of 75 and default max When: rendering Then: inner bar width should be 75%", () => {
    // Arrange & Act
    render(<Progress value={75} />);

    // Assert
    const progressbar = screen.getByRole("progressbar");
    const innerBar = progressbar.firstChild as HTMLElement;
    expect(innerBar.style.width).toBe("75%");
  });

  it("Given: a custom max of 200 and value of 100 When: rendering Then: inner bar width should be 50%", () => {
    // Arrange & Act
    render(<Progress value={100} max={200} />);

    // Assert
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuemax", "200");
    const innerBar = progressbar.firstChild as HTMLElement;
    expect(innerBar.style.width).toBe("50%");
  });

  it("Given: a value exceeding max When: rendering Then: inner bar should be clamped to 100%", () => {
    // Arrange & Act
    render(<Progress value={150} max={100} />);

    // Assert
    const progressbar = screen.getByRole("progressbar");
    const innerBar = progressbar.firstChild as HTMLElement;
    expect(innerBar.style.width).toBe("100%");
  });

  it("Given: a negative value When: rendering Then: inner bar should be clamped to 0%", () => {
    // Arrange & Act
    render(<Progress value={-10} />);

    // Assert
    const progressbar = screen.getByRole("progressbar");
    const innerBar = progressbar.firstChild as HTMLElement;
    expect(innerBar.style.width).toBe("0%");
  });

  it("Given: a value of 0 When: rendering Then: inner bar width should be 0%", () => {
    // Arrange & Act
    render(<Progress value={0} />);

    // Assert
    const progressbar = screen.getByRole("progressbar");
    const innerBar = progressbar.firstChild as HTMLElement;
    expect(innerBar.style.width).toBe("0%");
  });

  it("Given: a custom className When: rendering Then: should apply it to the progress container", () => {
    // Arrange & Act
    render(<Progress value={50} className="my-class" />);

    // Assert
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar.className).toContain("my-class");
  });
});
