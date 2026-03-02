import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SaleTimeline } from "@/modules/sales/presentation/components/sale-timeline";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock("@/modules/sales/presentation/components/sale-timeline.module.css", () => ({
  default: {},
}));

// --- Helpers ---

const baseDate = new Date("2026-02-01T10:00:00Z");

function makeProps(overrides: Partial<Parameters<typeof SaleTimeline>[0]> = {}) {
  return {
    status: "DRAFT" as const,
    pickingEnabled: true,
    createdAt: baseDate,
    createdByName: "Alice",
    confirmedAt: null,
    confirmedByName: null,
    pickedAt: null,
    pickedByName: null,
    shippedAt: null,
    shippedByName: null,
    completedAt: null,
    completedByName: null,
    cancelledAt: null,
    cancelledByName: null,
    returnedAt: null,
    returnedByName: null,
    ...overrides,
  };
}

// --- Tests ---

describe("SaleTimeline", () => {
  it("Given: DRAFT status with picking enabled When: rendering Then: should display all 5 timeline steps", () => {
    // Arrange
    const props = makeProps({ status: "DRAFT", pickingEnabled: true });

    // Act
    render(<SaleTimeline {...props} />);

    // Assert — all 5 steps are visible
    expect(screen.getByText("timeline.draft")).toBeDefined();
    expect(screen.getByText("timeline.confirmed")).toBeDefined();
    expect(screen.getByText("timeline.picking")).toBeDefined();
    expect(screen.getByText("timeline.shipped")).toBeDefined();
    expect(screen.getByText("timeline.completed")).toBeDefined();
  });

  it("Given: DRAFT status with picking disabled When: rendering Then: should display only 2 timeline steps (DRAFT and CONFIRMED)", () => {
    // Arrange
    const props = makeProps({ status: "DRAFT", pickingEnabled: false });

    // Act
    render(<SaleTimeline {...props} />);

    // Assert
    expect(screen.getByText("timeline.draft")).toBeDefined();
    expect(screen.getByText("timeline.confirmed")).toBeDefined();
    expect(screen.queryByText("timeline.picking")).toBeNull();
    expect(screen.queryByText("timeline.shipped")).toBeNull();
    expect(screen.queryByText("timeline.completed")).toBeNull();
  });

  it("Given: CONFIRMED status with picking enabled When: rendering Then: DRAFT should be completed and CONFIRMED should be active", () => {
    // Arrange
    const props = makeProps({
      status: "CONFIRMED",
      pickingEnabled: true,
      confirmedAt: new Date("2026-02-02T12:00:00Z"),
      confirmedByName: "Bob",
    });

    // Act
    render(<SaleTimeline {...props} />);

    // Assert — DRAFT description is rendered (completed step)
    expect(screen.getByText("timeline.draftDescription")).toBeDefined();
    // CONFIRMED description is rendered (active step)
    expect(screen.getByText("timeline.confirmedDescription")).toBeDefined();
    // The confirming user name is shown
    expect(screen.getByText(/Bob/)).toBeDefined();
  });

  it("Given: COMPLETED status When: rendering Then: all steps should be completed and byName info displayed", () => {
    // Arrange
    const props = makeProps({
      status: "COMPLETED",
      pickingEnabled: true,
      confirmedAt: new Date("2026-02-02T12:00:00Z"),
      confirmedByName: "Bob",
      pickedAt: new Date("2026-02-03T14:00:00Z"),
      pickedByName: "Charlie",
      shippedAt: new Date("2026-02-04T16:00:00Z"),
      shippedByName: "Diana",
      completedAt: new Date("2026-02-05T18:00:00Z"),
      completedByName: "Eve",
    });

    // Act
    render(<SaleTimeline {...props} />);

    // Assert — all step labels visible
    expect(screen.getByText("timeline.draft")).toBeDefined();
    expect(screen.getByText("timeline.confirmed")).toBeDefined();
    expect(screen.getByText("timeline.picking")).toBeDefined();
    expect(screen.getByText("timeline.shipped")).toBeDefined();
    expect(screen.getByText("timeline.completed")).toBeDefined();
    // All byName values should be displayed
    expect(screen.getByText(/Alice/)).toBeDefined();
    expect(screen.getByText(/Bob/)).toBeDefined();
    expect(screen.getByText(/Charlie/)).toBeDefined();
    expect(screen.getByText(/Diana/)).toBeDefined();
    expect(screen.getByText(/Eve/)).toBeDefined();
  });

  it("Given: CANCELLED status When: rendering Then: should replace uncompleted steps with CANCELLED step", () => {
    // Arrange
    const props = makeProps({
      status: "CANCELLED",
      pickingEnabled: true,
      cancelledAt: new Date("2026-02-06T10:00:00Z"),
      cancelledByName: "Frank",
    });

    // Act
    render(<SaleTimeline {...props} />);

    // Assert — CANCELLED step is shown
    expect(screen.getByText("timeline.cancelled")).toBeDefined();
    expect(screen.getByText("timeline.cancelledDescription")).toBeDefined();
    expect(screen.getByText(/Frank/)).toBeDefined();
    // Steps after the cancellation point should NOT appear
    expect(screen.queryByText("timeline.picking")).toBeNull();
    expect(screen.queryByText("timeline.shipped")).toBeNull();
    expect(screen.queryByText("timeline.completed")).toBeNull();
  });

  it("Given: RETURNED status When: rendering Then: should append RETURNED step after full workflow", () => {
    // Arrange
    const props = makeProps({
      status: "RETURNED",
      pickingEnabled: true,
      confirmedAt: new Date("2026-02-02T12:00:00Z"),
      confirmedByName: "Bob",
      pickedAt: new Date("2026-02-03T14:00:00Z"),
      pickedByName: "Charlie",
      shippedAt: new Date("2026-02-04T16:00:00Z"),
      shippedByName: "Diana",
      completedAt: new Date("2026-02-05T18:00:00Z"),
      completedByName: "Eve",
      returnedAt: new Date("2026-02-10T12:00:00Z"),
      returnedByName: "Grace",
    });

    // Act
    render(<SaleTimeline {...props} />);

    // Assert
    expect(screen.getByText("timeline.returned")).toBeDefined();
    expect(screen.getByText("timeline.returnedDescription")).toBeDefined();
    expect(screen.getByText(/Grace/)).toBeDefined();
  });
});
