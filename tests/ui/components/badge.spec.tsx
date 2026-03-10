import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/ui/components/badge";

describe("Badge", () => {
  it("Given: no variant prop When: rendering Then: should render with default variant", () => {
    // Arrange & Act
    render(<Badge>Default</Badge>);

    // Assert
    const badge = screen.getByText("Default");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-primary");
  });

  it("Given: variant is secondary When: rendering Then: should apply secondary styles", () => {
    // Arrange & Act
    render(<Badge variant="secondary">Secondary</Badge>);

    // Assert
    const badge = screen.getByText("Secondary");
    expect(badge.className).toContain("bg-secondary");
  });

  it("Given: variant is destructive When: rendering Then: should apply destructive styles", () => {
    // Arrange & Act
    render(<Badge variant="destructive">Destructive</Badge>);

    // Assert
    const badge = screen.getByText("Destructive");
    expect(badge.className).toContain("bg-destructive");
  });

  it("Given: variant is outline When: rendering Then: should apply outline styles", () => {
    // Arrange & Act
    render(<Badge variant="outline">Outline</Badge>);

    // Assert
    const badge = screen.getByText("Outline");
    expect(badge.className).toContain("text-foreground");
  });

  it("Given: variant is success When: rendering Then: should apply success styles", () => {
    // Arrange & Act
    render(<Badge variant="success">Success</Badge>);

    // Assert
    const badge = screen.getByText("Success");
    expect(badge.className).toContain("bg-success-100");
    expect(badge.className).toContain("text-success-800");
  });

  it("Given: variant is warning When: rendering Then: should apply warning styles", () => {
    // Arrange & Act
    render(<Badge variant="warning">Warning</Badge>);

    // Assert
    const badge = screen.getByText("Warning");
    expect(badge.className).toContain("bg-warning-100");
    expect(badge.className).toContain("text-warning-800");
  });

  it("Given: variant is info When: rendering Then: should apply info styles", () => {
    // Arrange & Act
    render(<Badge variant="info">Info</Badge>);

    // Assert
    const badge = screen.getByText("Info");
    expect(badge.className).toContain("bg-info-100");
    expect(badge.className).toContain("text-info-800");
  });

  it("Given: variant is error When: rendering Then: should apply error styles", () => {
    // Arrange & Act
    render(<Badge variant="error">Error</Badge>);

    // Assert
    const badge = screen.getByText("Error");
    expect(badge.className).toContain("bg-error-100");
    expect(badge.className).toContain("text-error-800");
  });

  it("Given: a custom className When: rendering Then: should merge it with variant classes", () => {
    // Arrange & Act
    render(<Badge className="custom-class">Custom</Badge>);

    // Assert
    const badge = screen.getByText("Custom");
    expect(badge.className).toContain("custom-class");
    expect(badge.className).toContain("bg-primary");
  });

  it("Given: extra HTML attributes When: rendering Then: should pass them through to the div", () => {
    // Arrange & Act
    render(<Badge data-testid="my-badge">Test</Badge>);

    // Assert
    expect(screen.getByTestId("my-badge")).toBeInTheDocument();
  });
});
