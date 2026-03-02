import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "@/modules/dashboard/presentation/components/stat-card";
import { Package, DollarSign, AlertTriangle, XCircle } from "lucide-react";

describe("StatCard", () => {
  it("Given: title and numeric value When: rendering Then: should display title and value", () => {
    // Arrange & Act
    render(<StatCard title="Total Products" value={1250} icon={Package} />);

    // Assert
    expect(screen.getByText("Total Products")).toBeDefined();
    expect(screen.getByText("1250")).toBeDefined();
  });

  it("Given: string value When: rendering Then: should display formatted value", () => {
    // Arrange & Act
    render(<StatCard title="Revenue" value="$45,000" icon={DollarSign} />);

    // Assert
    expect(screen.getByText("Revenue")).toBeDefined();
    expect(screen.getByText("$45,000")).toBeDefined();
  });

  it("Given: description provided When: rendering Then: should display description text", () => {
    // Arrange & Act
    render(
      <StatCard
        title="Low Stock"
        value={12}
        description="+3 since yesterday"
        icon={AlertTriangle}
        color="warning"
      />,
    );

    // Assert
    expect(screen.getByText("Low Stock")).toBeDefined();
    expect(screen.getByText("12")).toBeDefined();
    expect(screen.getByText("+3 since yesterday")).toBeDefined();
  });

  it("Given: no description When: rendering Then: should not display description paragraph", () => {
    // Arrange & Act
    const { container } = render(
      <StatCard title="Out of Stock" value={5} icon={XCircle} color="error" />,
    );

    // Assert
    expect(screen.getByText("Out of Stock")).toBeDefined();
    expect(screen.getByText("5")).toBeDefined();
    const descriptionElements = container.querySelectorAll(
      ".text-muted-foreground",
    );
    // The description paragraph should not exist
    const paragraphs = container.querySelectorAll("p.text-xs");
    expect(paragraphs.length).toBe(0);
  });

  it("Given: color primary (default) When: rendering Then: should apply primary color styles to icon wrapper", () => {
    // Arrange & Act
    const { container } = render(
      <StatCard title="Items" value={100} icon={Package} />,
    );

    // Assert
    const iconWrapper = container.querySelector(".bg-primary\\/10");
    expect(iconWrapper).toBeDefined();
  });

  it("Given: color success When: rendering Then: should apply success color styles to icon wrapper", () => {
    // Arrange & Act
    const { container } = render(
      <StatCard title="Sales" value={200} icon={DollarSign} color="success" />,
    );

    // Assert
    const iconWrapper = container.querySelector(".bg-success\\/10");
    expect(iconWrapper).toBeDefined();
  });
});
