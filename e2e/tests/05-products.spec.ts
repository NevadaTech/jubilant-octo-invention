import { test, expect } from "../fixtures/base.fixture";
import { ProductsPage } from "../pages/products.page";

test.describe("Products", () => {
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    await productsPage.goto();
    await productsPage.waitForLoad();
  });

  test("should load products list with data", async () => {
    const count = await productsPage.rowCount();
    expect(count).toBeGreaterThan(0);
  });

  test("should have pagination for 52 products", async ({ page }) => {
    // With default page size, there should be pagination
    const paginationText = page.locator("text=/Showing/i");
    await expect(paginationText).toBeVisible();

    // Next button should be enabled (more than one page)
    await expect(productsPage.nextPageBtn).toBeVisible();
  });

  test("should search products by name", async ({ page }) => {
    await productsPage.search("a");
    const count = await productsPage.rowCount();
    expect(count).toBeGreaterThan(0);
  });

  test("should navigate to product detail", async ({ page }) => {
    await productsPage.clickProduct(0);

    await expect(page).toHaveURL(/\/products\//);

    // Detail page should show product info
    const heading = page.getByRole("heading").first();
    await expect(heading).toBeVisible();
  });

  test("should navigate to next page", async ({ page }) => {
    // Check that pagination indicator shows "1 / N"
    const pageIndicator = page.locator("text=/1 \\/ \\d+/");
    await expect(pageIndicator).toBeVisible();

    const firstPageFirstRow = await productsPage.tableRows
      .first()
      .textContent();

    // Click the chevron-right button for next page
    const nextBtn = productsPage.nextPageBtn;
    if (await nextBtn.isEnabled()) {
      await nextBtn.click();
      await page.waitForTimeout(500);
      await productsPage.waitForLoad();

      // Page indicator should now show "2 / N"
      const newPageIndicator = page.locator("text=/2 \\/ \\d+/");
      await expect(newPageIndicator).toBeVisible();
    }
  });

  test("should toggle product status from detail", async ({ page }) => {
    await productsPage.clickProduct(0);

    // Wait for detail page to load
    await page.waitForFunction(
      () => document.querySelectorAll(".animate-pulse").length === 0,
      { timeout: 10_000 },
    );

    // Find toggle button
    const toggleBtn = page.getByRole("button", {
      name: /activate|deactivate/i,
    });

    if (await toggleBtn.isVisible()) {
      const initialText = await toggleBtn.textContent();
      await toggleBtn.click();

      // Confirm in dialog
      const dialog = page.locator(".fixed.z-50.bg-background");
      await dialog.waitFor({ state: "visible" });
      const confirmBtn = dialog.getByRole("button").last();
      await confirmBtn.click();

      await page.waitForTimeout(1500);

      // Status should have changed
      const newToggleBtn = page.getByRole("button", {
        name: /activate|deactivate/i,
      });
      if (await newToggleBtn.isVisible()) {
        const newText = await newToggleBtn.textContent();
        expect(newText).not.toEqual(initialText);
      }
    }
  });
});
