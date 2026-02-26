import { type Page } from "@playwright/test";

export async function navigateTo(page: Page, path: string) {
  const url = `/en${path.startsWith("/") ? path : `/${path}`}`;
  await page.goto(url);
  await page.waitForLoadState("domcontentloaded");
}
