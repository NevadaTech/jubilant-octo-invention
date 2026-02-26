import { type Page, type Locator } from "@playwright/test";
import { waitForSkeletonsGone } from "../helpers/wait-helpers";

export class ReportsPage {
  readonly page: Page;
  readonly tabs: Locator;
  readonly reportCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tabs = page.locator('[role="tablist"] [role="tab"]');
    this.reportCards = page.locator(
      '[role="tabpanel"] a, [role="tabpanel"] [class*="card"]',
    );
  }

  async goto() {
    await this.page.goto("/en/dashboard/reports", {
      waitUntil: "domcontentloaded",
    });
  }

  async waitForLoad() {
    await waitForSkeletonsGone(this.page);
  }

  async clickTab(name: string) {
    await this.page.getByRole("tab", { name }).click();
    await this.page.waitForTimeout(300);
  }

  async clickReportCard(index: number) {
    const cards = this.page.locator("a[href*='/reports/']");
    await cards.nth(index).click();
    await this.page.waitForLoadState("domcontentloaded");
  }
}
