import { type Page, type Locator } from "@playwright/test";

export class SidebarPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  navItem(label: string): Locator {
    return this.page.locator(`aside`).getByText(label, { exact: true });
  }

  async navigateTo(label: string) {
    await this.navItem(label).click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async expandMenu(label: string) {
    const btn = this.page
      .locator("aside")
      .locator(`button:has-text("${label}")`);
    await btn.click();
  }

  async isNavItemVisible(label: string): Promise<boolean> {
    return this.navItem(label).isVisible();
  }

  allNavItems(): Locator {
    return this.page.locator("aside nav a, aside nav button");
  }
}
