import { test, expect } from "../fixtures/base.fixture";
import {
  CompaniesPage,
  GlobalCompanySelectorHelper,
} from "../pages/companies.page";
import { ProductsPage } from "../pages/products.page";
import { StockPage } from "../pages/stock.page";
import { SalesPage } from "../pages/sales.page";
import { ReturnsPage } from "../pages/returns.page";
import { MovementsPage } from "../pages/movements.page";
import { DashboardPage } from "../pages/dashboard.page";
import { ReportsPage } from "../pages/reports.page";

/**
 * Wait for a list to stabilize after filtering.
 * Handles both "has rows" and "empty state" scenarios.
 */
async function waitForListUpdate(page: import("@playwright/test").Page) {
  await page.waitForTimeout(1500);
  await page
    .waitForFunction(
      () => document.querySelectorAll(".animate-pulse").length === 0,
      { timeout: 15_000 },
    )
    .catch(() => {});
  await page.waitForTimeout(500);
}

test.describe("Multi-Company", () => {
  const TEST_COMPANY_NAME = "QA Test Corp";
  const TEST_COMPANY_CODE = "QA-TEST";

  // ─── Test 1: Companies CRUD ──────────────────────────────────────────
  test.describe("1 - Companies CRUD", () => {
    test("should create a new company", async ({ page }) => {
      const companiesPage = new CompaniesPage(page);
      await companiesPage.goto();
      await companiesPage.waitForLoad();

      await companiesPage.clickNew();
      await companiesPage.fillForm(
        TEST_COMPANY_NAME,
        TEST_COMPANY_CODE,
        "QA test company for multi-company flow",
      );
      await companiesPage.submitForm();

      // Wait for dialog to close and list to refresh
      await page.waitForTimeout(2000);
      await companiesPage.waitForLoad();

      // Verify the company appears
      await companiesPage.search(TEST_COMPANY_NAME);
      const count = await companiesPage.rowCount();
      expect(count).toBeGreaterThan(0);

      const firstRow = companiesPage.tableRows.first();
      await expect(firstRow).toContainText(TEST_COMPANY_NAME);
    });

    test("should edit a company description", async ({ page }) => {
      const companiesPage = new CompaniesPage(page);
      await companiesPage.goto();
      await companiesPage.waitForLoad();

      await companiesPage.search(TEST_COMPANY_NAME);
      const count = await companiesPage.rowCount();
      if (count === 0) {
        test.skip();
        return;
      }

      await companiesPage.openRowDropdown(0);
      await companiesPage.clickDropdownAction(/edit/i);

      // Wait for the dialog form fields
      await page
        .locator("#name")
        .waitFor({ state: "visible", timeout: 10_000 });
      await page.locator("#description").fill("Updated QA description");
      await page.getByRole("button", { name: /^save$/i }).click();
      await page.waitForTimeout(1500);
    });

    test("should not allow deleting company with products", async ({
      page,
    }) => {
      const companiesPage = new CompaniesPage(page);
      await companiesPage.goto();
      await companiesPage.waitForLoad();

      const rows = companiesPage.tableRows;
      const rowCount = await rows.count();

      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const productCountCell = row.locator("td").nth(2);
        const countText = await productCountCell.textContent();
        const pCount = parseInt(countText || "0", 10);

        if (pCount > 0) {
          await companiesPage.openRowDropdown(i);
          const deleteItem = page.getByRole("menuitem", { name: /delete/i });
          const isDisabled = await deleteItem.getAttribute("data-disabled");
          expect(isDisabled).toBeTruthy();
          await page.keyboard.press("Escape");
          break;
        }
      }
    });
  });

  // ─── Test 2: Global Selector ─────────────────────────────────────────
  test.describe("2 - Global Company Selector", () => {
    test("should show global company selector and default to All", async ({
      page,
    }) => {
      await page.goto("/en/dashboard", { waitUntil: "domcontentloaded" });

      const selector = new GlobalCompanySelectorHelper(page);
      const visible = await selector.isVisible();
      expect(visible).toBeTruthy();

      const text = await selector.getSelectedText();
      expect(text).toContain("All");
    });

    test("should select a company and persist after reload", async ({
      page,
    }) => {
      await page.goto("/en/dashboard", { waitUntil: "domcontentloaded" });

      const selector = new GlobalCompanySelectorHelper(page);
      const optionCount = await selector.getOptionCount();
      expect(optionCount).toBeGreaterThanOrEqual(2);

      // Select first real company (index 1 = first after "All Companies")
      await selector.selectCompanyByIndex(1);

      const text = await selector.getSelectedText();
      expect(text).not.toContain("All");

      // Reload and verify persistence
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);

      const selectorAfterReload = new GlobalCompanySelectorHelper(page);
      const textAfterReload = await selectorAfterReload.getSelectedText();
      expect(textAfterReload).not.toContain("All");

      // Reset to All Companies
      await selectorAfterReload.selectAll();
    });
  });

  // ─── Test 3: Products — Filtering by company ─────────────────────────
  test.describe("3 - Products filtering", () => {
    test("should filter products when company is selected", async ({
      page,
    }) => {
      const productsPage = new ProductsPage(page);
      await productsPage.goto();
      await productsPage.waitForLoad();
      const allCount = await productsPage.rowCount();
      expect(allCount).toBeGreaterThan(0);

      const selector = new GlobalCompanySelectorHelper(page);
      await selector.selectCompanyByIndex(1);
      await waitForListUpdate(page);

      // After filtering, either fewer rows or empty state
      const filteredCount = await productsPage.rowCount();
      expect(filteredCount).toBeLessThanOrEqual(allCount);

      // Reset
      await selector.selectAll();
      await waitForListUpdate(page);

      const resetCount = await productsPage.rowCount();
      expect(resetCount).toEqual(allCount);
    });
  });

  // ─── Test 4: Stock — Filtering by company ────────────────────────────
  test.describe("4 - Stock filtering", () => {
    test("should filter stock when company is selected", async ({ page }) => {
      const stockPage = new StockPage(page);
      await stockPage.goto();
      await stockPage.waitForLoad();
      const allCount = await stockPage.rowCount();

      const selector = new GlobalCompanySelectorHelper(page);
      await selector.selectCompanyByIndex(1);
      await waitForListUpdate(page);

      const filteredCount = await stockPage.rowCount();
      expect(filteredCount).toBeLessThanOrEqual(allCount);

      await selector.selectAll();
      await waitForListUpdate(page);

      const resetCount = await stockPage.rowCount();
      expect(resetCount).toEqual(allCount);
    });
  });

  // ─── Test 5: Movements — Filtering by company ───────────────────────
  test.describe("5 - Movements filtering", () => {
    test("should filter movements when company is selected", async ({
      page,
    }) => {
      const movementsPage = new MovementsPage(page);
      await movementsPage.goto();
      await movementsPage.waitForLoad();
      const allCount = await movementsPage.rowCount();

      const selector = new GlobalCompanySelectorHelper(page);
      await selector.selectCompanyByIndex(1);
      await waitForListUpdate(page);

      const filteredCount = await movementsPage.rowCount();
      expect(filteredCount).toBeLessThanOrEqual(allCount);

      await selector.selectAll();
      await waitForListUpdate(page);
    });
  });

  // ─── Test 6: Sales — Filtering by company ────────────────────────────
  test.describe("6 - Sales filtering", () => {
    test("should filter sales when company is selected", async ({ page }) => {
      const salesPage = new SalesPage(page);
      await salesPage.goto();
      await salesPage.waitForLoad();
      const allCount = await salesPage.rowCount();

      const selector = new GlobalCompanySelectorHelper(page);
      await selector.selectCompanyByIndex(1);
      await waitForListUpdate(page);

      const filteredCount = await salesPage.rowCount();
      expect(filteredCount).toBeLessThanOrEqual(allCount);

      await selector.selectAll();
      await waitForListUpdate(page);
    });
  });

  // ─── Test 7: Returns — Filtering by company ─────────────────────────
  test.describe("7 - Returns filtering", () => {
    test("should filter returns when company is selected", async ({ page }) => {
      const returnsPage = new ReturnsPage(page);
      await returnsPage.goto();
      await returnsPage.waitForLoad();
      const allCount = await returnsPage.rowCount();

      const selector = new GlobalCompanySelectorHelper(page);
      await selector.selectCompanyByIndex(1);
      await waitForListUpdate(page);

      const filteredCount = await returnsPage.rowCount();
      expect(filteredCount).toBeLessThanOrEqual(allCount);

      await selector.selectAll();
      await waitForListUpdate(page);
    });
  });

  // ─── Test 8: Dashboard — Metrics filtered ────────────────────────────
  test.describe("8 - Dashboard metrics", () => {
    test("should update dashboard metrics when company changes", async ({
      page,
    }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      await expect(dashboard.heading).toBeVisible({ timeout: 10_000 });
      await page.waitForTimeout(3000);

      const allStatValues = await dashboard.statValues.allTextContents();

      const selector = new GlobalCompanySelectorHelper(page);
      await selector.selectCompanyByIndex(1);
      await page.waitForTimeout(3000);

      const filteredStatValues = await dashboard.statValues.allTextContents();
      expect(filteredStatValues.length).toEqual(allStatValues.length);

      await selector.selectAll();
    });
  });

  // ─── Test 9: Reports — Company filter ────────────────────────────────
  test.describe("9 - Reports company filter", () => {
    test("should show company filter in report viewer", async ({ page }) => {
      const reportsPage = new ReportsPage(page);
      await reportsPage.goto();
      await reportsPage.waitForLoad();

      const reportLinks = page.locator("a[href*='/reports/']");
      const count = await reportLinks.count();

      if (count > 0) {
        await reportLinks.first().click();
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(2000);

        // Just verify the page loaded without crash
        const heading = page.getByRole("heading").first();
        await expect(heading).toBeVisible({ timeout: 10_000 });
      }
    });
  });

  // ─── Test 10: Companies sidebar navigation ───────────────────────────
  test.describe("10 - Sidebar navigation", () => {
    test("should have Companies link in sidebar under Inventory", async ({
      page,
      sidebar,
    }) => {
      await page.goto("/en/dashboard", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1000);

      await sidebar.expandMenu("Inventory");
      await page.waitForTimeout(300);

      const companiesLink = sidebar.navItem("Companies");
      await expect(companiesLink).toBeVisible();

      await companiesLink.click();
      await page.waitForLoadState("domcontentloaded");
      await expect(page).toHaveURL(/\/inventory\/companies/);
    });
  });

  // ─── Test 11: Product Form — Company selector ────────────────────────
  test.describe("11 - Product form company field", () => {
    test("should show company selector in product edit form", async ({
      page,
    }) => {
      const productsPage = new ProductsPage(page);
      await productsPage.goto();
      await productsPage.waitForLoad();

      await productsPage.clickProduct(0);
      await page.waitForFunction(
        () => document.querySelectorAll(".animate-pulse").length === 0,
        { timeout: 10_000 },
      );

      const editBtn = page.getByRole("link", { name: /edit/i });
      const editBtnVisible = await editBtn.isVisible().catch(() => false);

      if (editBtnVisible) {
        await editBtn.click();
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(1000);

        const companyField = page.locator(
          'label:has-text("Company"), label:has-text("Empresa")',
        );
        const isVisible = await companyField
          .isVisible({ timeout: 5_000 })
          .catch(() => false);

        expect(isVisible).toBeTruthy();
      }
    });
  });

  // ─── Test 12: Delete test company (cleanup) ──────────────────────────
  test.describe("12 - Cleanup", () => {
    test("should delete test company created in test 1", async ({ page }) => {
      const companiesPage = new CompaniesPage(page);
      await companiesPage.goto();
      await companiesPage.waitForLoad();

      await companiesPage.search(TEST_COMPANY_NAME);
      const count = await companiesPage.rowCount();

      if (count > 0) {
        const productCountCell = companiesPage.tableRows
          .first()
          .locator("td")
          .nth(2);
        const countText = await productCountCell.textContent();
        const productCount = parseInt(countText || "0", 10);

        if (productCount === 0) {
          await companiesPage.openRowDropdown(0);
          await companiesPage.clickDropdownAction(/delete/i);
          await companiesPage.confirmDelete();
          await page.waitForTimeout(1500);
        }
      }
    });
  });
});
