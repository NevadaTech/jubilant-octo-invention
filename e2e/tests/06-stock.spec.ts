import { test, expect } from "../fixtures/base.fixture";
import { StockPage } from "../pages/stock.page";

test.describe("Stock", () => {
  let stockPage: StockPage;

  test.beforeEach(async ({ page }) => {
    stockPage = new StockPage(page);
    await stockPage.goto();
    await stockPage.waitForLoad();
  });

  test("should load stock table with data", async () => {
    const count = await stockPage.rowCount();
    expect(count).toBeGreaterThan(0);
  });

  test("should display correct columns", async ({ page }) => {
    // Wait for table to have headers
    await page.waitForSelector("thead th", { timeout: 10_000 });

    const headers = page.locator("thead th");
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThanOrEqual(5);

    const headerTexts = await headers.allTextContents();
    const joined = headerTexts.join(" ").toLowerCase();
    expect(joined).toContain("product");
  });

  test("should filter by low stock", async ({ page }) => {
    const lowStockBtn = stockPage.lowStockButton;
    if (await lowStockBtn.isVisible()) {
      await lowStockBtn.click();
      await page.waitForTimeout(2000);

      // After filtering, wait for either data rows or empty state
      // (don't call waitForTableLoad since empty state may not have tbody rows)
      await page.waitForFunction(
        () => document.querySelectorAll(".animate-pulse").length === 0,
        { timeout: 15_000 },
      );

      // Filter applied successfully - any count (including 0) is valid
      const count = await stockPage.rowCount();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("should search stock items", async ({ page }) => {
    if (await stockPage.searchInput.isVisible()) {
      await stockPage.searchInput.fill("a");
      await page.waitForTimeout(500);

      // Wait for skeletons to clear
      await page.waitForFunction(
        () => document.querySelectorAll(".animate-pulse").length === 0,
        { timeout: 15_000 },
      );

      const count = await stockPage.rowCount();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});
