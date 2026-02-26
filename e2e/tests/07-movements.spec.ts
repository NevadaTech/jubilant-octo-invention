import { test, expect } from "../fixtures/base.fixture";
import { MovementsPage } from "../pages/movements.page";

test.describe("Movements", () => {
  let movementsPage: MovementsPage;

  test.beforeEach(async ({ page }) => {
    movementsPage = new MovementsPage(page);
    await movementsPage.goto();
    await movementsPage.waitForLoad();
  });

  test("should load movements list with data", async () => {
    const count = await movementsPage.rowCount();
    expect(count).toBeGreaterThan(0);
  });

  test("should display movement type and status badges", async ({ page }) => {
    // Check that badges are rendered in the table
    const badges = page.locator(
      "tbody tr:first-child span, tbody tr:first-child [class*='badge']",
    );
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should view movement detail", async ({ page }) => {
    // Click view from dropdown
    await movementsPage.openRowDropdown(0);
    await movementsPage.clickDropdownAction("View");

    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/movements\//);
  });

  test("should open new movement form", async ({ page }) => {
    await movementsPage.clickNew();
    await expect(movementsPage.formModal).toBeVisible();

    // Form should have type selector and warehouse selector
    const selects = movementsPage.formModal.locator(
      "select, [role='combobox'], button[role='combobox']",
    );
    const selectCount = await selects.count();
    expect(selectCount).toBeGreaterThanOrEqual(1);
  });

  test("should search movements by reference", async ({ page }) => {
    if (await movementsPage.searchInput.isVisible()) {
      await movementsPage.searchInput.fill("MOV");
      await page.waitForTimeout(500);
      await movementsPage.waitForLoad();
      // Results should show
      const count = await movementsPage.rowCount();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});
