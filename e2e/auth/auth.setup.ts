import { test as setup } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import {
  DEMO_ORG,
  ADMIN_USER,
  VENDEDOR_USER,
  CONSULTOR_USER,
  AUTH_STORAGE,
} from "../fixtures/test-data";

setup("authenticate as admin", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(DEMO_ORG, ADMIN_USER.email, ADMIN_USER.password);
  await loginPage.waitForRedirectToDashboard();
  await page.context().storageState({ path: AUTH_STORAGE.admin });
});

setup("authenticate as vendedor", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(DEMO_ORG, VENDEDOR_USER.email, VENDEDOR_USER.password);
  await loginPage.waitForRedirectToDashboard();
  await page.context().storageState({ path: AUTH_STORAGE.vendedor });
});

setup("authenticate as consultor", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(
    DEMO_ORG,
    CONSULTOR_USER.email,
    CONSULTOR_USER.password,
  );
  await loginPage.waitForRedirectToDashboard();
  await page.context().storageState({ path: AUTH_STORAGE.consultor });
});
