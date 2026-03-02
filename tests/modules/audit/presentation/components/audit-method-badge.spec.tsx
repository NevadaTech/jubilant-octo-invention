import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuditMethodBadge } from "@/modules/audit/presentation/components/audit-method-badge";

describe("AuditMethodBadge", () => {
  it("Given: GET method When: rendering Then: should display GET text with secondary variant", () => {
    // Arrange & Act
    render(<AuditMethodBadge method="GET" />);

    // Assert
    expect(screen.getByText("GET")).toBeDefined();
    const badge = screen.getByText("GET").closest("div");
    expect(badge?.className).toContain("bg-secondary");
  });

  it("Given: POST method When: rendering Then: should display POST text with success variant", () => {
    // Arrange & Act
    render(<AuditMethodBadge method="POST" />);

    // Assert
    expect(screen.getByText("POST")).toBeDefined();
    const badge = screen.getByText("POST").closest("div");
    expect(badge?.className).toContain("bg-success");
  });

  it("Given: DELETE method When: rendering Then: should display DELETE text with destructive variant", () => {
    // Arrange & Act
    render(<AuditMethodBadge method="DELETE" />);

    // Assert
    expect(screen.getByText("DELETE")).toBeDefined();
    const badge = screen.getByText("DELETE").closest("div");
    expect(badge?.className).toContain("bg-destructive");
  });

  it("Given: null method When: rendering Then: should display dash placeholder", () => {
    // Arrange & Act
    render(<AuditMethodBadge method={null} />);

    // Assert
    expect(screen.getByText("-")).toBeDefined();
    const span = screen.getByText("-");
    expect(span.className).toContain("text-muted-foreground");
  });

  it("Given: unknown method When: rendering Then: should display method text with secondary fallback variant", () => {
    // Arrange & Act
    render(<AuditMethodBadge method="OPTIONS" />);

    // Assert
    expect(screen.getByText("OPTIONS")).toBeDefined();
    const badge = screen.getByText("OPTIONS").closest("div");
    expect(badge?.className).toContain("bg-secondary");
  });
});
