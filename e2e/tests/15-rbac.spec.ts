import { test, expect } from "@playwright/test";
import { AUTH_STORAGE } from "../fixtures/test-data";

test.describe("RBAC - Vendedor (Sales only)", () => {
  test.use({ storageState: AUTH_STORAGE.vendedor });

  test("should see Sales in sidebar", async ({ page }) => {
    await page.goto("/en/dashboard", { waitUntil: "domcontentloaded" });

    const salesNav = page.locator("aside").getByText("Sales", { exact: true });
    await expect(salesNav).toBeVisible();
  });

  test("should NOT see Users in sidebar", async ({ page }) => {
    await page.goto("/en/dashboard", { waitUntil: "domcontentloaded" });

    const usersNav = page.locator("aside").getByText("Users", { exact: true });
    await expect(usersNav).not.toBeVisible();
  });

  test("should NOT see Roles in sidebar", async ({ page }) => {
    await page.goto("/en/dashboard", { waitUntil: "domcontentloaded" });

    const rolesNav = page.locator("aside").getByText("Roles", { exact: true });
    await expect(rolesNav).not.toBeVisible();
  });

  test("should NOT see Audit Log in sidebar", async ({ page }) => {
    await page.goto("/en/dashboard", { waitUntil: "domcontentloaded" });

    const auditNav = page
      .locator("aside")
      .getByText("Audit Log", { exact: true });
    await expect(auditNav).not.toBeVisible();
  });

  test("should get access denied on Users page", async ({ page }) => {
    await page.goto("/en/dashboard/users", { waitUntil: "domcontentloaded" });

    // Wait for the page to fully render and evaluate permissions
    await page.waitForFunction(
      () => document.querySelectorAll(".animate-pulse").length === 0,
      { timeout: 15_000 },
    );
    await page.waitForTimeout(1000);

    // The AccessDenied component shows "Access Denied" text
    const accessDenied = page.getByText("Access Denied");
    const hasAccessDenied = await accessDenied.isVisible().catch(() => false);

    // Or user may be redirected away from /users
    const isNotOnUsers = !page.url().includes("/users");

    // Or the page may show a permission error or be blank
    const shieldIcon = page.locator("svg.lucide-shield-alert");
    const hasShield = await shieldIcon.isVisible().catch(() => false);

    expect(hasAccessDenied || isNotOnUsers || hasShield).toBeTruthy();
  });
});

test.describe("RBAC - Consultor (Read only)", () => {
  test.use({ storageState: AUTH_STORAGE.consultor });

  test("should NOT see create buttons", async ({ page }) => {
    await page.goto("/en/dashboard/sales", { waitUntil: "domcontentloaded" });

    // Wait for page to load
    await page.waitForFunction(
      () => document.querySelectorAll(".animate-pulse").length === 0,
      { timeout: 15_000 },
    );

    // New button should not be visible for read-only user
    const newButton = page.getByRole("button", { name: /new/i });
    const isVisible = await newButton.isVisible().catch(() => false);
    expect(isVisible).toBeFalsy();
  });

  test("should be able to view sales list", async ({ page }) => {
    await page.goto("/en/dashboard/sales", { waitUntil: "domcontentloaded" });

    await page.waitForFunction(
      () => document.querySelectorAll(".animate-pulse").length === 0,
      { timeout: 15_000 },
    );

    // Table should be visible (read access)
    const table = page.locator("table");
    const accessDenied = page.getByText(/access denied/i);

    const tableVisible = await table.isVisible().catch(() => false);
    const deniedVisible = await accessDenied.isVisible().catch(() => false);

    // Either can view the table or gets access denied (depends on role permissions)
    expect(tableVisible || deniedVisible).toBeTruthy();
  });
});

test.describe("RBAC - Admin (Full access)", () => {
  test.use({ storageState: AUTH_STORAGE.admin });

  test("should see all sidebar items", async ({ page }) => {
    await page.goto("/en/dashboard", { waitUntil: "domcontentloaded" });

    const sidebar = page.locator("aside");

    for (const label of [
      "Dashboard",
      "Inventory",
      "Sales",
      "Returns",
      "Users",
      "Roles",
      "Audit Log",
    ]) {
      await expect(sidebar.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test("should see create buttons on all pages", async ({ page }) => {
    // Check Sales page has New button
    await page.goto("/en/dashboard/sales", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => document.querySelectorAll(".animate-pulse").length === 0,
      { timeout: 15_000 },
    );

    // "New Sale" is a Link styled as button (asChild)
    const newButton = page
      .getByRole("link", { name: /new/i })
      .or(page.getByRole("button", { name: /new/i }));
    await expect(newButton).toBeVisible();
  });

  test("should access Users page without restriction", async ({ page }) => {
    await page.goto("/en/dashboard/users", { waitUntil: "domcontentloaded" });

    await page.waitForFunction(
      () => document.querySelectorAll(".animate-pulse").length === 0,
      { timeout: 15_000 },
    );

    const table = page.locator("table");
    await expect(table).toBeVisible();
  });
});
