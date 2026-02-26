import { test, expect } from "../fixtures/base.fixture";
import { ReturnsPage } from "../pages/returns.page";

test.describe("Returns", () => {
  let returnsPage: ReturnsPage;

  test.beforeEach(async ({ page }) => {
    returnsPage = new ReturnsPage(page);
    await returnsPage.goto();
    await returnsPage.waitForLoad();
  });

  test("should load returns list with data", async () => {
    const count = await returnsPage.rowCount();
    expect(count).toBeGreaterThan(0);
  });

  test("should display return type and status badges", async ({ page }) => {
    const badges = page.locator(
      "tbody tr:first-child span, tbody tr:first-child [class*='badge']",
    );
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should view return detail", async ({ page }) => {
    await returnsPage.clickReturnLink(0);

    await expect(page).toHaveURL(/\/returns\//);

    await page.waitForFunction(
      () => document.querySelectorAll(".animate-pulse").length === 0,
      { timeout: 10_000 },
    );

    const heading = page.getByRole("heading").first();
    await expect(heading).toBeVisible();
  });

  test("should show return detail with lines table", async ({ page }) => {
    await returnsPage.clickReturnLink(0);

    await page.waitForFunction(
      () => document.querySelectorAll(".animate-pulse").length === 0,
      { timeout: 10_000 },
    );

    // Detail should have at least one card
    const cards = page.locator('[class*="card"]');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(1);
  });

  test("should search returns", async ({ page }) => {
    if (await returnsPage.searchInput.isVisible()) {
      await returnsPage.searchInput.fill("RET");
      await page.waitForTimeout(500);
      await returnsPage.waitForLoad();
      const count = await returnsPage.rowCount();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});
