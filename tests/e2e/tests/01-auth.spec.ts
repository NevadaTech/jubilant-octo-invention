import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { DEMO_ORG, ADMIN_USER } from "../fixtures/test-data";

// Auth tests run WITHOUT storageState
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Authentication", () => {
  test("should login with valid credentials and redirect to dashboard", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(DEMO_ORG, ADMIN_USER.email, ADMIN_USER.password);
    await loginPage.waitForRedirectToDashboard();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should show error with invalid password", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(DEMO_ORG, ADMIN_USER.email, "wrongpassword");

    await expect(loginPage.errorMessage).toBeVisible({ timeout: 10_000 });
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.submitButton.click();

    // Zod validation should prevent form submission
    // Check that we're still on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test("should persist session after reload", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(DEMO_ORG, ADMIN_USER.email, ADMIN_USER.password);
    await loginPage.waitForRedirectToDashboard();

    // Reload the page
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // Wait a moment for client-side auth check
    await page.waitForTimeout(2000);

    // Should still be on dashboard (not redirected to login)
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should logout and redirect to login", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(DEMO_ORG, ADMIN_USER.email, ADMIN_USER.password);
    await loginPage.waitForRedirectToDashboard();

    // Logout button is an icon button with title "Log out" in the header
    const logoutBtn = page.locator('button[title="Log out"]');
    await expect(logoutBtn).toBeVisible({ timeout: 5_000 });
    await logoutBtn.click();

    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
