import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReportCatalog } from "@/modules/reports/presentation/components/report-catalog";

// --- Mocks ---

const mockGet = vi.fn().mockReturnValue(null);

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
  useLocale: () => "en",
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

vi.mock("@/ui/components/tabs", () => ({
  Tabs: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (v: string) => void;
  }) => (
    <div data-testid="tabs" data-value={value}>
      {children}
    </div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({
    children,
    value,
    onClick,
  }: {
    children: React.ReactNode;
    value: string;
    onClick?: () => void;
  }) => (
    <button data-testid={`tab-${value}`} data-value={value} onClick={onClick}>
      {children}
    </button>
  ),
  TabsContent: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => (
    <div data-testid={`tab-content-${value}`} data-value={value}>
      {children}
    </div>
  ),
}));

vi.mock("./report-card", () => ({
  ReportCard: ({
    type,
    title,
    category,
  }: {
    type: string;
    title: string;
    description: string;
    category: string;
    locale: string;
  }) => (
    <div data-testid={`report-card-${type}`} data-category={category}>
      {title}
    </div>
  ),
}));

vi.mock("@/ui/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("lucide-react")>();
  const Icon = ({ className }: { className?: string }) => (
    <svg data-testid="icon" className={className} />
  );
  return {
    ...actual,
    BarChart2: Icon,
    Package: Icon,
    ShoppingCart: Icon,
    PackageX: Icon,
  };
});

// --- Tests ---

describe("ReportCatalog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue(null);
  });

  it("Given: no tab in URL When: rendering Then: should display the page title and description", () => {
    // Arrange & Act
    render(<ReportCatalog />);

    // Assert
    expect(screen.getByText("title")).toBeDefined();
    expect(screen.getByText("description")).toBeDefined();
  });

  it("Given: no tab in URL When: rendering Then: should default to inventory tab", () => {
    // Arrange & Act
    render(<ReportCatalog />);

    // Assert
    const tabs = screen.getByTestId("tabs");
    expect(tabs.getAttribute("data-value")).toBe("inventory");
  });

  it("Given: catalog When: rendering Then: should render tabs for all three categories", () => {
    // Arrange & Act
    render(<ReportCatalog />);

    // Assert
    expect(screen.getByTestId("tab-inventory")).toBeDefined();
    expect(screen.getByTestId("tab-sales")).toBeDefined();
    expect(screen.getByTestId("tab-returns")).toBeDefined();
  });

  it("Given: catalog When: rendering Then: should render tab content areas for all categories", () => {
    // Arrange & Act
    render(<ReportCatalog />);

    // Assert
    expect(screen.getByTestId("tab-content-inventory")).toBeDefined();
    expect(screen.getByTestId("tab-content-sales")).toBeDefined();
    expect(screen.getByTestId("tab-content-returns")).toBeDefined();
  });

  it("Given: tab=sales in URL When: rendering Then: should initialize with sales tab active", () => {
    // Arrange
    mockGet.mockReturnValue("sales");

    // Act
    render(<ReportCatalog />);

    // Assert
    const tabs = screen.getByTestId("tabs");
    expect(tabs.getAttribute("data-value")).toBe("sales");
  });

  it("Given: invalid tab in URL When: rendering Then: should default to inventory tab", () => {
    // Arrange
    mockGet.mockReturnValue("nonexistent");

    // Act
    render(<ReportCatalog />);

    // Assert
    const tabs = screen.getByTestId("tabs");
    expect(tabs.getAttribute("data-value")).toBe("inventory");
  });

  it("Given: catalog When: rendering Then: should display category names from translations", () => {
    // Arrange & Act
    render(<ReportCatalog />);

    // Assert
    // Category names appear in both tabs and badges
    expect(screen.getAllByText("categories.inventory").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("categories.sales").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("categories.returns").length).toBeGreaterThanOrEqual(1);
  });
});
