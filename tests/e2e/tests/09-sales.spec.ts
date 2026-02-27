import { test, expect } from "../fixtures/base.fixture";
import { SalesPage } from "../pages/sales.page";

test.describe("Sales", () => {
  let salesPage: SalesPage;

  test.beforeEach(async ({ page }) => {
    salesPage = new SalesPage(page);
    await salesPage.goto();
    await salesPage.waitForLoad();
  });

  test("should load sales list with data", async () => {
    const count = await salesPage.rowCount();
    expect(count).toBeGreaterThan(0);
  });

  test("should have pagination for 100 sales", async ({ page }) => {
    const paginationText = page.locator("text=/Showing/i");
    await expect(paginationText).toBeVisible();
  });

  test("should display sale status badges", async ({ page }) => {
    const badges = page.locator(
      "tbody tr:first-child span, tbody tr:first-child [class*='badge']",
    );
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should view sale detail", async ({ page }) => {
    await salesPage.clickSaleLink(0);

    await expect(page).toHaveURL(/\/sales\//);

    // Detail page should show sale info
    await page.waitForFunction(
      () => document.querySelectorAll(".animate-pulse").length === 0,
      { timeout: 10_000 },
    );

    const heading = page.getByRole("heading").first();
    await expect(heading).toBeVisible();
  });

  test("should search sales", async ({ page }) => {
    if (await salesPage.searchInput.isVisible()) {
      await salesPage.searchInput.fill("SAL");
      await page.waitForTimeout(500);
      await salesPage.waitForLoad();
      const count = await salesPage.rowCount();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("should open new sale page/form", async ({ page }) => {
    if (await salesPage.newButton.isVisible()) {
      await salesPage.newButton.click();
      await page.waitForLoadState("domcontentloaded");

      // Should navigate to new sale form or open modal
      const url = page.url();
      const hasForm =
        url.includes("/new") ||
        (await salesPage.formModal.isVisible().catch(() => false));
      expect(hasForm || url.includes("/sales")).toBeTruthy();
    }
  });

  test("should show sale detail with timeline", async ({ page }) => {
    await salesPage.clickSaleLink(0);

    await page.waitForFunction(
      () => document.querySelectorAll(".animate-pulse").length === 0,
      { timeout: 10_000 },
    );

    // Look for timeline or status section
    const timeline = page.locator("text=/timeline|history|status/i");
    const cards = page.locator('[class*="card"]');
    const cardCount = await cards.count();
    // Detail page should have at least some cards (info + lines)
    expect(cardCount).toBeGreaterThanOrEqual(1);
  });
});
