import { test, expect } from "../fixtures/base.fixture";
import { CategoriesPage } from "../pages/categories.page";
import { uniqueName } from "../helpers/data-generators";
import { waitForModalClose } from "../helpers/wait-helpers";

test.describe("Categories", () => {
  let categoriesPage: CategoriesPage;

  test.beforeEach(async ({ page }) => {
    categoriesPage = new CategoriesPage(page);
    await categoriesPage.goto();
    await categoriesPage.waitForLoad();
  });

  test("should load categories list with data", async () => {
    const count = await categoriesPage.rowCount();
    expect(count).toBeGreaterThan(0);
  });

  test("should search categories", async () => {
    const initialCount = await categoriesPage.rowCount();
    await categoriesPage.search("Electronics");

    // Either finds results or shows fewer results
    const afterCount = await categoriesPage.rowCount();
    // Search should filter the list (could be 0 if no match)
    expect(afterCount).toBeLessThanOrEqual(initialCount);
  });

  test("should create a new category", async ({ page }) => {
    const name = uniqueName("Category");
    await categoriesPage.clickNew();
    await categoriesPage.fillForm(name, "E2E test category");
    await categoriesPage.submitForm();

    await waitForModalClose(page);
    await categoriesPage.waitForLoad();

    // Search for the created category
    await categoriesPage.search(name);
    const count = await categoriesPage.rowCount();
    expect(count).toBeGreaterThanOrEqual(1);
    await expect(page.getByText(name)).toBeVisible();
  });

  test("should edit a category", async ({ page }) => {
    // First create one to edit
    const originalName = uniqueName("EditCat");
    await categoriesPage.clickNew();
    await categoriesPage.fillForm(originalName, "To be edited");
    await categoriesPage.submitForm();
    await waitForModalClose(page);
    await categoriesPage.waitForLoad();

    // Search for it and edit
    await categoriesPage.search(originalName);
    await categoriesPage.openRowActions(0);
    await categoriesPage.clickDropdownAction("Edit");

    const formModal = categoriesPage.formModal;
    await formModal.waitFor({ state: "visible" });

    const updatedName = uniqueName("Updated");
    await categoriesPage.nameInput.fill(updatedName);

    const saveBtn = formModal.getByRole("button", { name: /save/i });
    await saveBtn.click();
    await waitForModalClose(page);
    await categoriesPage.waitForLoad();

    // Verify updated
    await categoriesPage.search(updatedName);
    await expect(page.getByText(updatedName)).toBeVisible();
  });

  test("should delete a category without products", async ({ page }) => {
    // Create a category specifically to delete
    const name = uniqueName("DeleteCat");
    await categoriesPage.clickNew();
    await categoriesPage.fillForm(name, "To be deleted");
    await categoriesPage.submitForm();
    await waitForModalClose(page);
    await categoriesPage.waitForLoad();

    // Search and delete
    await categoriesPage.search(name);
    await categoriesPage.openRowActions(0);
    await categoriesPage.clickDropdownAction("Delete");
    await categoriesPage.confirmDelete();

    // Wait for the delete API call to complete and the row to disappear
    await page.waitForFunction(
      (nameText) => {
        const rows = document.querySelectorAll("tbody tr");
        for (const row of rows) {
          if (row.textContent?.includes(nameText)) return false;
        }
        return true;
      },
      name,
      { timeout: 10_000 },
    );
  });

  test("should show validation errors for empty form", async ({ page }) => {
    await categoriesPage.clickNew();

    // Try to submit without filling
    await categoriesPage.submitForm();

    // Form should still be visible (not closed)
    await expect(categoriesPage.formModal).toBeVisible();
  });
});
