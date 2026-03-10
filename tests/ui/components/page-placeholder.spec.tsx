import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PagePlaceholder } from "@/ui/components/page-placeholder";

describe("PagePlaceholder", () => {
  it("Given: title and description When: rendering Then: should display the title", () => {
    // Arrange & Act
    render(<PagePlaceholder title="Reports" description="View your reports" />);

    // Assert
    expect(screen.getByText("Reports")).toBeInTheDocument();
  });

  it("Given: title and description When: rendering Then: should display the description", () => {
    // Arrange & Act
    render(<PagePlaceholder title="Reports" description="View your reports" />);

    // Assert
    expect(screen.getByText("View your reports")).toBeInTheDocument();
  });

  it("Given: component rendered When: displaying Then: should show 'Coming Soon' text", () => {
    // Arrange & Act
    render(<PagePlaceholder title="Any" description="Any desc" />);

    // Assert
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
  });

  it("Given: component rendered When: displaying Then: should show under development message", () => {
    // Arrange & Act
    render(<PagePlaceholder title="Any" description="Any desc" />);

    // Assert
    expect(
      screen.getByText("This feature is currently under development."),
    ).toBeInTheDocument();
  });

  it("Given: component rendered When: inspecting DOM Then: title should be in an h1 element", () => {
    // Arrange & Act
    render(<PagePlaceholder title="My Module" description="Module desc" />);

    // Assert
    const heading = screen.getByText("My Module");
    expect(heading.tagName).toBe("H1");
  });
});
