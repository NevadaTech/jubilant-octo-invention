import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuditStatusIndicator } from "@/modules/audit/presentation/components/audit-status-indicator";

describe("AuditStatusIndicator", () => {
  it("Given: null statusCode When: rendering Then: should display a dash icon with muted styling", () => {
    // Arrange & Act
    const { container } = render(<AuditStatusIndicator statusCode={null} />);

    // Assert
    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
    expect(svg?.classList.toString()).toContain("text-muted-foreground");
  });

  it("Given: 200 statusCode When: rendering Then: should display success indicator with status code text", () => {
    // Arrange & Act
    render(<AuditStatusIndicator statusCode={200} />);

    // Assert
    expect(screen.getByText("200")).toBeDefined();
    // The text "200" is inside <span class="text-xs">200</span>
    // which is inside <span class="flex items-center gap-1 text-emerald-600">
    const outerWrapper = screen.getByText("200").parentElement;
    expect(outerWrapper?.className).toContain("text-emerald-600");
  });

  it("Given: 201 statusCode When: rendering Then: should display success indicator with status code text", () => {
    // Arrange & Act
    render(<AuditStatusIndicator statusCode={201} />);

    // Assert
    expect(screen.getByText("201")).toBeDefined();
    const outerWrapper = screen.getByText("201").parentElement;
    expect(outerWrapper?.className).toContain("text-emerald-600");
  });

  it("Given: 404 statusCode When: rendering Then: should display error indicator with status code text", () => {
    // Arrange & Act
    render(<AuditStatusIndicator statusCode={404} />);

    // Assert
    expect(screen.getByText("404")).toBeDefined();
    const outerWrapper = screen.getByText("404").parentElement;
    expect(outerWrapper?.className).toContain("text-destructive");
  });

  it("Given: 500 statusCode When: rendering Then: should display error indicator with status code text", () => {
    // Arrange & Act
    render(<AuditStatusIndicator statusCode={500} />);

    // Assert
    expect(screen.getByText("500")).toBeDefined();
    const outerWrapper = screen.getByText("500").parentElement;
    expect(outerWrapper?.className).toContain("text-destructive");
  });
});
