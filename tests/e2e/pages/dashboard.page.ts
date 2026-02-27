import { type Page, type Locator } from "@playwright/test";
import { waitForSkeletonsGone } from "../helpers/wait-helpers";

export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly statCards: Locator;
  readonly statValues: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Dashboard" });
    this.statCards = page.locator(".grid.gap-4 > div");
    this.statValues = page.locator(".text-2xl.font-bold");
  }

  async goto() {
    await this.page.goto("/en/dashboard");
    await this.page.waitForLoadState("domcontentloaded");
  }

  async waitForLoad() {
    await waitForSkeletonsGone(this.page);
  }
}
