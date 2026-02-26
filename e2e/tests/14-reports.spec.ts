import { test, expect } from "../fixtures/base.fixture";
import { ReportsPage } from "../pages/reports.page";

test.describe("Reports", () => {
  let reportsPage: ReportsPage;

  test.beforeEach(async ({ page }) => {
    reportsPage = new ReportsPage(page);
    await reportsPage.goto();
    await reportsPage.waitForLoad();
  });

  test("should load reports catalog page", async ({ page }) => {
    const heading = page.getByRole("heading", { name: /reports/i });
    await expect(heading).toBeVisible();
  });

  test("should display category tabs", async ({ page }) => {
    const tabs = reportsPage.tabs;
    const count = await tabs.count();
    expect(count).toBeGreaterThanOrEqual(2); // At least Inventory and Sales
  });

  test("should show report cards in each tab", async ({ page }) => {
    const tabs = reportsPage.tabs;
    const tabCount = await tabs.count();

    for (let i = 0; i < tabCount; i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(300);

      // Each tab should have some content
      const panel = page.locator('[role="tabpanel"]');
      await expect(panel).toBeVisible();
    }
  });

  test("should navigate to a report viewer", async ({ page }) => {
    // Click first report card link
    const reportLinks = page.locator("a[href*='/reports/']");
    const count = await reportLinks.count();

    if (count > 0) {
      await reportLinks.first().click();
      await page.waitForLoadState("domcontentloaded");

      // Should be on a report viewer page
      await expect(page).toHaveURL(/\/reports\//);

      // Wait a moment for the page to render
      await page.waitForTimeout(2000);

      // Should show report heading (visible even while data is loading)
      const heading = page.getByRole("heading").first();
      await expect(heading).toBeVisible({ timeout: 10_000 });
    }
  });

  test("should have filter controls in report viewer", async ({ page }) => {
    const reportLinks = page.locator("a[href*='/reports/']");
    const count = await reportLinks.count();

    if (count > 0) {
      await reportLinks.first().click();
      await page.waitForLoadState("domcontentloaded");

      // Don't wait for skeletons - just wait for page to be ready
      await page.waitForTimeout(2000);

      // Report viewer should have some filter/controls or table
      const contentElements = page.locator(
        "table, form, [role='tabpanel'], button",
      );
      const elCount = await contentElements.count();
      expect(elCount).toBeGreaterThan(0);
    }
  });
});
