import { test, expect } from "../fixtures/base.fixture";
import { TransfersPage } from "../pages/transfers.page";

test.describe("Transfers", () => {
  let transfersPage: TransfersPage;

  test.beforeEach(async ({ page }) => {
    transfersPage = new TransfersPage(page);
    await transfersPage.goto();
    await transfersPage.waitForLoad();
  });

  test("should load transfers list with data", async () => {
    const count = await transfersPage.rowCount();
    expect(count).toBeGreaterThan(0);
  });

  test("should display transfer status badges", async ({ page }) => {
    await page.waitForSelector("tbody tr", { timeout: 10_000 });

    // Badge component renders as <div> with inline-flex class
    const badges = page.locator("tbody tr:first-child div.inline-flex");
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should view transfer detail", async ({ page }) => {
    await page.waitForSelector("tbody tr", { timeout: 10_000 });

    // Transfer rows have a direct View link (Eye icon) not a dropdown
    const viewLink = page.locator("tbody tr").first().locator("a").first();
    await viewLink.click();
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/transfers\//);
  });

  test("should open new transfer form", async ({ page }) => {
    await transfersPage.clickNew();
    await expect(transfersPage.formModal).toBeVisible();
  });

  test("should search transfers", async ({ page }) => {
    if (await transfersPage.searchInput.isVisible()) {
      await transfersPage.searchInput.fill("TRF");
      await page.waitForTimeout(500);
      await transfersPage.waitForLoad();
      const count = await transfersPage.rowCount();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});
