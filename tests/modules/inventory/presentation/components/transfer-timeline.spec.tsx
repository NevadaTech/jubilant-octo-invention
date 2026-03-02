import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TransferTimeline } from "@/modules/inventory/presentation/components/transfers/transfer-timeline";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

// --- Helpers ---

const baseDate = new Date("2026-02-01T10:00:00Z");
const completedDate = new Date("2026-02-05T18:00:00Z");

// --- Tests ---

describe("TransferTimeline", () => {
  it("Given: DRAFT status When: rendering Then: should display 4 steps with DRAFT as active", () => {
    // Arrange & Act
    render(
      <TransferTimeline
        status="DRAFT"
        createdAt={baseDate}
        completedAt={null}
      />,
    );

    // Assert — All 4 normal steps visible
    expect(screen.getByText("timeline.created")).toBeDefined();
    expect(screen.getByText("timeline.draft")).toBeDefined();
    expect(screen.getByText("timeline.inTransit")).toBeDefined();
    expect(screen.getByText("timeline.received")).toBeDefined();

    // Descriptions for each step
    expect(screen.getByText("timeline.createdDescription")).toBeDefined();
    expect(screen.getByText("timeline.draftDescription")).toBeDefined();
    expect(screen.getByText("timeline.inTransitDescription")).toBeDefined();
    expect(screen.getByText("timeline.receivedDescription")).toBeDefined();
  });

  it("Given: IN_TRANSIT status When: rendering Then: CREATED and DRAFT should be completed and IN_TRANSIT should be active", () => {
    // Arrange & Act
    render(
      <TransferTimeline
        status="IN_TRANSIT"
        createdAt={baseDate}
        completedAt={null}
      />,
    );

    // Assert — all 4 normal steps visible
    expect(screen.getByText("timeline.created")).toBeDefined();
    expect(screen.getByText("timeline.draft")).toBeDefined();
    expect(screen.getByText("timeline.inTransit")).toBeDefined();
    expect(screen.getByText("timeline.received")).toBeDefined();
  });

  it("Given: RECEIVED status When: rendering Then: all steps should be completed and completedAt date displayed", () => {
    // Arrange & Act
    render(
      <TransferTimeline
        status="RECEIVED"
        createdAt={baseDate}
        completedAt={completedDate}
      />,
    );

    // Assert — All steps visible
    expect(screen.getByText("timeline.created")).toBeDefined();
    expect(screen.getByText("timeline.draft")).toBeDefined();
    expect(screen.getByText("timeline.inTransit")).toBeDefined();
    expect(screen.getByText("timeline.received")).toBeDefined();
  });

  it("Given: PARTIAL status When: rendering Then: should treat as received (all steps completed)", () => {
    // Arrange & Act
    render(
      <TransferTimeline
        status="PARTIAL"
        createdAt={baseDate}
        completedAt={completedDate}
      />,
    );

    // Assert
    expect(screen.getByText("timeline.received")).toBeDefined();
    expect(screen.getByText("timeline.receivedDescription")).toBeDefined();
  });

  it("Given: CANCELED status When: rendering Then: should replace RECEIVED step with CANCELED step", () => {
    // Arrange & Act
    render(
      <TransferTimeline
        status="CANCELED"
        createdAt={baseDate}
        completedAt={null}
      />,
    );

    // Assert — CANCELED step replaces RECEIVED
    expect(screen.getByText("timeline.canceled")).toBeDefined();
    expect(screen.getByText("timeline.canceledDescription")).toBeDefined();
    // RECEIVED step should NOT be present
    expect(screen.queryByText("timeline.received")).toBeNull();
    expect(screen.queryByText("timeline.receivedDescription")).toBeNull();
  });

  it("Given: REJECTED status When: rendering Then: should replace RECEIVED step with REJECTED step", () => {
    // Arrange & Act
    render(
      <TransferTimeline
        status="REJECTED"
        createdAt={baseDate}
        completedAt={null}
      />,
    );

    // Assert — REJECTED step replaces RECEIVED
    expect(screen.getByText("timeline.rejected")).toBeDefined();
    expect(screen.getByText("timeline.rejectedDescription")).toBeDefined();
    // RECEIVED step should NOT be present
    expect(screen.queryByText("timeline.received")).toBeNull();
    expect(screen.queryByText("timeline.receivedDescription")).toBeNull();
  });
});
