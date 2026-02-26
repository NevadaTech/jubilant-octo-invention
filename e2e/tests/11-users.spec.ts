import { test, expect } from "../fixtures/base.fixture";
import { UsersPage } from "../pages/users.page";
import { uniqueName, uniqueEmail } from "../helpers/data-generators";
import { waitForModalClose } from "../helpers/wait-helpers";

test.describe("Users", () => {
  let usersPage: UsersPage;

  test.beforeEach(async ({ page }) => {
    usersPage = new UsersPage(page);
    await usersPage.goto();
    await usersPage.waitForLoad();
  });

  test("should load users list with data", async () => {
    const count = await usersPage.rowCount();
    expect(count).toBeGreaterThan(0);
  });

  test("should search users", async ({ page }) => {
    await usersPage.search("admin");
    const count = await usersPage.rowCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should display user status badges", async ({ page }) => {
    // Wait for data rows to appear
    await page.waitForSelector("tbody tr", { timeout: 10_000 });

    const firstRow = page.locator("tbody tr").first();
    // Badge component renders as <div> with inline-flex class
    const badges = firstRow.locator("div.inline-flex");
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should open create user form", async ({ page }) => {
    const newBtn = usersPage.newButton;
    if (await newBtn.isVisible()) {
      await newBtn.click();
      await usersPage.formModal.waitFor({ state: "visible", timeout: 5_000 });

      // Use input[name] selector to avoid strict mode violation
      const firstNameInput = usersPage.formModal.locator(
        'input[name="firstName"]',
      );
      await expect(firstNameInput).toBeVisible();
    }
  });

  test("should create a new user", async ({ page }) => {
    const newBtn = usersPage.newButton;
    if (!(await newBtn.isVisible())) return;

    await newBtn.click();
    await usersPage.formModal.waitFor({ state: "visible", timeout: 5_000 });

    const firstName = uniqueName("User");
    const email = uniqueEmail();

    const modal = usersPage.formModal;
    // Use input[name] selectors to avoid strict mode violation
    await modal.locator('input[name="firstName"]').fill(firstName);
    await modal.locator('input[name="lastName"]').fill("Test");
    await modal.locator('input[name="email"]').fill(email);
    await modal.locator('input[name="username"]').fill(`e2e${Date.now()}`);
    await modal.locator('input[name="password"]').fill("Test1234!");

    const createBtn = modal.getByRole("button", { name: /create/i });
    await createBtn.click();

    await waitForModalClose(page);
    await usersPage.waitForLoad();

    await usersPage.search(firstName);
    await expect(page.getByText(firstName)).toBeVisible();
  });

  test("should open user actions dropdown", async ({ page }) => {
    await usersPage.openRowDropdown(0);

    const menuItems = page.locator('[role="menuitem"]');
    const count = await menuItems.count();
    expect(count).toBeGreaterThan(0);
  });
});
