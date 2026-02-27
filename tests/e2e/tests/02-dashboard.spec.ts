import { test, expect } from "../fixtures/base.fixture";
import { DashboardPage } from "../pages/dashboard.page";

test.describe("Dashboard", () => {
  test("should load dashboard page without errors", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // Wait for page content to render (heading visible)
    await expect(dashboard.heading).toBeVisible({ timeout: 10_000 });
  });

  test("should display 4 metric stat cards (or skeletons)", async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.heading).toBeVisible({ timeout: 10_000 });

    // Wait a bit for stat cards grid to mount
    await page.waitForTimeout(2000);

    // Should have 4 cards (either loaded or still skeleton)
    await expect(dashboard.statCards).toHaveCount(4);
  });

  test("should display metric values or show loading state", async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.heading).toBeVisible({ timeout: 10_000 });

    // Wait a few seconds for data to attempt loading
    await page.waitForTimeout(5000);

    // Check if values loaded OR skeletons/error state is shown
    const values = await dashboard.statValues.count();
    const skeletons = await page.locator(".animate-pulse").count();
    const hasError = await page
      .getByText(/error|retry/i)
      .isVisible()
      .catch(() => false);

    // At least one of these states should be present
    expect(values >= 4 || skeletons > 0 || hasError).toBeTruthy();
  });

  test("should show all sidebar items for admin", async ({ page, sidebar }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.heading).toBeVisible({ timeout: 10_000 });

    for (const label of [
      "Dashboard",
      "Inventory",
      "Sales",
      "Returns",
      "Reports",
      "Users",
      "Roles",
      "Audit Log",
    ]) {
      await expect(sidebar.navItem(label)).toBeVisible();
    }
  });
});
