import { type Page, expect } from "@playwright/test";

export async function waitForTableLoad(page: Page, timeout = 20_000) {
  // Step 1: Wait for React to mount - either table rows or skeletons must appear
  await page.waitForFunction(
    () => {
      const rows = document.querySelectorAll("tbody tr");
      const skeletons = document.querySelectorAll(".animate-pulse");
      return rows.length > 0 || skeletons.length > 0;
    },
    { timeout },
  );

  // Step 2: Now wait for skeletons to disappear (data loaded)
  await page.waitForFunction(
    () => document.querySelectorAll(".animate-pulse").length === 0,
    { timeout },
  );
  await page.waitForTimeout(300);
}

export async function waitForContentLoad(page: Page, timeout = 20_000) {
  // Wait for skeletons to appear, then disappear
  try {
    await page.waitForSelector(".animate-pulse", { timeout: 5_000 });
  } catch {
    // Skeletons may have already gone or never appeared
  }
  await page.waitForFunction(
    () => document.querySelectorAll(".animate-pulse").length === 0,
    { timeout },
  );
  await page.waitForTimeout(300);
}

export async function waitForPageReady(page: Page) {
  await page.waitForLoadState("domcontentloaded", { timeout: 15_000 });
  await page.waitForTimeout(300);
}

export async function waitForToast(page: Page, textMatch?: string | RegExp) {
  const toast = page.locator("[data-sonner-toast]").first();
  await expect(toast).toBeVisible({ timeout: 10_000 });
  if (textMatch) {
    await expect(toast).toContainText(textMatch);
  }
  return toast;
}

export async function waitForDialogClose(page: Page) {
  await page.waitForFunction(
    () => {
      const dialogs = document.querySelectorAll(".fixed.z-50.bg-background");
      return dialogs.length === 0;
    },
    { timeout: 10_000 },
  );
}

export async function waitForModalClose(page: Page) {
  await page.waitForFunction(
    () => !document.querySelector(".fixed.inset-0.z-50"),
    { timeout: 10_000 },
  );
}

export async function waitForSkeletonsGone(page: Page) {
  try {
    await page.waitForSelector(".animate-pulse", { timeout: 5_000 });
  } catch {
    // Skeletons may have already gone
  }
  await page.waitForFunction(
    () => document.querySelectorAll(".animate-pulse").length === 0,
    { timeout: 20_000 },
  );
}
