import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { StatCardSkeleton } from "@/modules/dashboard/presentation/components/stat-card-skeleton";

describe("StatCardSkeleton", () => {
  it("Given: rendering When: loading Then: should render a card element", () => {
    const { container } = render(<StatCardSkeleton />);
    const card = container.firstElementChild;
    expect(card).not.toBeNull();
  });

  it("Given: rendering When: loading Then: should show animated pulse elements", () => {
    const { container } = render(<StatCardSkeleton />);
    const pulseElements = container.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThanOrEqual(4);
  });

  it("Given: rendering When: loading Then: should have a title placeholder (h-4 w-24)", () => {
    const { container } = render(<StatCardSkeleton />);
    const titlePlaceholder = container.querySelector(".h-4.w-24");
    expect(titlePlaceholder).not.toBeNull();
  });

  it("Given: rendering When: loading Then: should have an icon placeholder (rounded-full)", () => {
    const { container } = render(<StatCardSkeleton />);
    const iconPlaceholder = container.querySelector(".rounded-full");
    expect(iconPlaceholder).not.toBeNull();
  });

  it("Given: rendering When: loading Then: should have a value placeholder (h-7 w-20)", () => {
    const { container } = render(<StatCardSkeleton />);
    const valuePlaceholder = container.querySelector(".h-7.w-20");
    expect(valuePlaceholder).not.toBeNull();
  });

  it("Given: rendering When: loading Then: should have a description placeholder (h-3 w-32)", () => {
    const { container } = render(<StatCardSkeleton />);
    const descPlaceholder = container.querySelector(".h-3.w-32");
    expect(descPlaceholder).not.toBeNull();
  });

  it("Given: rendering When: loading Then: all skeleton elements should have rounded-md class", () => {
    const { container } = render(<StatCardSkeleton />);
    const roundedMd = container.querySelectorAll(".rounded-md");
    expect(roundedMd.length).toBeGreaterThanOrEqual(3);
  });

  it("Given: rendering When: loading Then: all skeleton elements should have bg-muted class", () => {
    const { container } = render(<StatCardSkeleton />);
    const mutedElements = container.querySelectorAll(".bg-muted");
    expect(mutedElements.length).toBeGreaterThanOrEqual(4);
  });
});
