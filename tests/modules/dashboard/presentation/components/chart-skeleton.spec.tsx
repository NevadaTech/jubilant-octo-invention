import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ChartSkeleton } from "@/modules/dashboard/presentation/components/chart-skeleton";

describe("ChartSkeleton", () => {
  it("Given: rendering When: loading Then: should render a card element", () => {
    const { container } = render(<ChartSkeleton />);
    const card = container.firstElementChild;
    expect(card).not.toBeNull();
  });

  it("Given: rendering When: loading Then: should show animated pulse elements", () => {
    const { container } = render(<ChartSkeleton />);
    const pulseElements = container.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThanOrEqual(3);
  });

  it("Given: rendering When: loading Then: should have a title placeholder", () => {
    const { container } = render(<ChartSkeleton />);
    const titlePlaceholder = container.querySelector(".h-5.w-32");
    expect(titlePlaceholder).not.toBeNull();
  });

  it("Given: rendering When: loading Then: should have a subtitle placeholder", () => {
    const { container } = render(<ChartSkeleton />);
    const subtitlePlaceholder = container.querySelector(".h-4.w-48");
    expect(subtitlePlaceholder).not.toBeNull();
  });

  it("Given: rendering When: loading Then: should have a chart area placeholder with 250px height", () => {
    const { container } = render(<ChartSkeleton />);
    const chartPlaceholder = container.querySelector(".h-\\[250px\\]");
    expect(chartPlaceholder).not.toBeNull();
  });

  it("Given: rendering When: loading Then: all placeholders should have bg-muted class", () => {
    const { container } = render(<ChartSkeleton />);
    const mutedElements = container.querySelectorAll(".bg-muted");
    expect(mutedElements.length).toBeGreaterThanOrEqual(3);
  });

  it("Given: rendering When: loading Then: should have rounded corners on placeholders", () => {
    const { container } = render(<ChartSkeleton />);
    const roundedElements = container.querySelectorAll(".rounded");
    expect(roundedElements.length).toBeGreaterThanOrEqual(3);
  });
});
