import { test, expect } from "../fixtures/base.fixture";
import { RolesPage } from "../pages/roles.page";
import { uniqueName } from "../helpers/data-generators";
import { waitForModalClose } from "../helpers/wait-helpers";

test.describe("Roles", () => {
  let rolesPage: RolesPage;

  test.beforeEach(async ({ page }) => {
    rolesPage = new RolesPage(page);
    await rolesPage.goto();
    await rolesPage.waitForLoad();
  });

  test("should load roles list with data", async () => {
    const count = await rolesPage.rowCount();
    expect(count).toBeGreaterThan(0);
  });

  test("should display system role badges", async ({ page }) => {
    await page.waitForSelector("tbody tr", { timeout: 10_000 });
    const systemBadges = page.locator("tbody").getByText(/system/i);
    const count = await systemBadges.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should create a custom role", async ({ page }) => {
    const newBtn = rolesPage.newButton;
    if (!(await newBtn.isVisible())) return;

    await newBtn.click();
    await rolesPage.formModal.waitFor({ state: "visible", timeout: 5_000 });

    const roleName = uniqueName("Role");
    const modal = rolesPage.formModal;

    // Use input fields by index since they don't have IDs
    const inputs = modal.locator("input");
    await inputs.first().fill(roleName);

    // Fill description textarea
    const textarea = modal.locator("textarea");
    if (await textarea.isVisible()) {
      await textarea.fill("E2E test role");
    }

    const createBtn = modal.getByRole("button", { name: /create/i });
    await createBtn.click();

    await waitForModalClose(page);
    await rolesPage.waitForLoad();

    await expect(page.getByText(roleName)).toBeVisible();
  });

  test("should view permissions of a role", async ({ page }) => {
    await rolesPage.openRowDropdown(0);

    const permissionsItem = page.getByRole("menuitem", {
      name: /permissions/i,
    });
    if (await permissionsItem.isVisible()) {
      await permissionsItem.click();

      // Dialog should open showing permissions
      const dialog = page.locator('[role="dialog"], .fixed.z-50');
      await dialog.first().waitFor({ state: "visible", timeout: 5_000 });
      await expect(dialog.first()).toBeVisible();

      // Close
      await page.keyboard.press("Escape");
    }
  });

  test("should delete a custom role", async ({ page }) => {
    const newBtn = rolesPage.newButton;
    if (!(await newBtn.isVisible())) return;

    const roleName = uniqueName("DelRole");
    await newBtn.click();
    await rolesPage.formModal.waitFor({ state: "visible", timeout: 5_000 });

    const modal = rolesPage.formModal;
    const inputs = modal.locator("input");
    await inputs.first().fill(roleName);

    const textarea = modal.locator("textarea");
    if (await textarea.isVisible()) {
      await textarea.fill("To delete");
    }

    await modal.getByRole("button", { name: /create/i }).click();
    await waitForModalClose(page);
    await rolesPage.waitForLoad();

    // Find and delete the role
    const row = page.locator("tbody tr").filter({ hasText: roleName });
    const moreBtn = row.locator("button").last();
    await moreBtn.click();

    await rolesPage.clickDropdownAction("Delete");

    // Confirm delete in the custom AlertDialog
    const deleteBtn = page
      .locator(".fixed.z-50")
      .getByRole("button", { name: /^delete$/i });
    await deleteBtn.waitFor({ state: "visible", timeout: 5_000 });
    await deleteBtn.click();

    // Wait for the delete API call to complete and the row to disappear
    await page.waitForFunction(
      (nameText) => {
        const rows = document.querySelectorAll("tbody tr");
        for (const row of rows) {
          if (row.textContent?.includes(nameText)) return false;
        }
        return true;
      },
      roleName,
      { timeout: 10_000 },
    );
  });
});
