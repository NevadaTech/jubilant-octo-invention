import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecentActivityFeed } from "@/modules/dashboard/presentation/components/recent-activity-feed";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock("@/ui/components/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="card-description">{children}</p>
  ),
}));

vi.mock("@/ui/components/badge", () => ({
  Badge: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant?: string;
  }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

vi.mock("lucide-react", () => ({
  ShoppingCart: ({ className }: { className?: string }) => (
    <svg data-testid="icon-shopping-cart" className={className} />
  ),
  ArrowRightLeft: ({ className }: { className?: string }) => (
    <svg data-testid="icon-arrow-right-left" className={className} />
  ),
  RotateCcw: ({ className }: { className?: string }) => (
    <svg data-testid="icon-rotate-ccw" className={className} />
  ),
  PackageCheck: ({ className }: { className?: string }) => (
    <svg data-testid="icon-package-check" className={className} />
  ),
}));

// --- Helpers ---

function makeActivityData() {
  const now = new Date();
  return [
    {
      type: "SALE",
      reference: "SAL-001",
      status: "COMPLETED",
      description: "Sale SAL-001 completed",
      createdAt: new Date(now.getTime() - 30 * 60000).toISOString(), // 30 min ago
    },
    {
      type: "MOVEMENT",
      reference: "MOV-002",
      status: "POSTED",
      description: "Stock movement posted",
      createdAt: new Date(now.getTime() - 3 * 3600000).toISOString(), // 3 hours ago
    },
    {
      type: "RETURN",
      reference: "RET-003",
      status: "DRAFT",
      description: "Return created",
      createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(), // 2 days ago
    },
  ];
}

// --- Tests ---

describe("RecentActivityFeed", () => {
  it("Given: activity data When: rendering Then: should display the feed title and description", () => {
    // Arrange & Act
    render(<RecentActivityFeed data={makeActivityData()} />);

    // Assert
    expect(screen.getByText("recentActivity.title")).toBeDefined();
    expect(screen.getByText("recentActivity.description")).toBeDefined();
  });

  it("Given: activity data When: rendering Then: should display description for each activity item", () => {
    // Arrange & Act
    render(<RecentActivityFeed data={makeActivityData()} />);

    // Assert
    expect(screen.getByText("Sale SAL-001 completed")).toBeDefined();
    expect(screen.getByText("Stock movement posted")).toBeDefined();
    expect(screen.getByText("Return created")).toBeDefined();
  });

  it("Given: activity data When: rendering Then: should display status badges with correct variants", () => {
    // Arrange & Act
    render(<RecentActivityFeed data={makeActivityData()} />);

    // Assert
    const badges = screen.getAllByTestId("badge");
    expect(badges).toHaveLength(3);

    // COMPLETED -> success, POSTED -> success, DRAFT -> secondary
    const completedBadge = badges.find((b) => b.textContent === "COMPLETED");
    expect(completedBadge?.getAttribute("data-variant")).toBe("success");

    const postedBadge = badges.find((b) => b.textContent === "POSTED");
    expect(postedBadge?.getAttribute("data-variant")).toBe("success");

    const draftBadge = badges.find((b) => b.textContent === "DRAFT");
    expect(draftBadge?.getAttribute("data-variant")).toBe("secondary");
  });

  it("Given: empty data array When: rendering Then: should display the noData message", () => {
    // Arrange & Act
    render(<RecentActivityFeed data={[]} />);

    // Assert
    expect(screen.getByText("noData")).toBeDefined();
  });

  it("Given: activity with unknown type When: rendering Then: should fall back to PackageCheck icon", () => {
    // Arrange
    const data = [
      {
        type: "UNKNOWN_TYPE",
        reference: "UNK-001",
        status: "CONFIRMED",
        description: "Unknown activity",
        createdAt: new Date().toISOString(),
      },
    ];

    // Act
    render(<RecentActivityFeed data={data} />);

    // Assert - falls back to PackageCheck for unknown type
    expect(screen.getByTestId("icon-package-check")).toBeDefined();
    expect(screen.getByText("Unknown activity")).toBeDefined();
  });

  it("Given: activity with TRANSFER type When: rendering Then: should render the ArrowRightLeft icon", () => {
    // Arrange
    const data = [
      {
        type: "TRANSFER",
        reference: "TRF-001",
        status: "IN_TRANSIT",
        description: "Transfer in transit",
        createdAt: new Date().toISOString(),
      },
    ];

    // Act
    render(<RecentActivityFeed data={data} />);

    // Assert
    expect(screen.getByTestId("icon-arrow-right-left")).toBeDefined();
    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("warning");
  });
});
