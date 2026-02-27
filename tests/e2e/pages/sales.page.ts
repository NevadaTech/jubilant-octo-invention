import { type Page, type Locator } from "@playwright/test";
import { waitForTableLoad } from "../helpers/wait-helpers";

export class SalesPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly newButton: Locator;
  readonly tableRows: Locator;
  readonly formModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder(/search/i);
    this.newButton = page.getByRole("button", { name: /new/i });
    this.tableRows = page.locator("tbody tr");
    this.formModal = page.locator(".fixed.inset-0.z-50");
  }

  async goto() {
    await this.page.goto("/en/dashboard/sales", {
      waitUntil: "domcontentloaded",
    });
  }

  async waitForLoad() {
    await waitForTableLoad(this.page);
  }

  async clickSaleLink(index: number) {
    const link = this.tableRows.nth(index).locator("a").first();
    await link.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async openRowDropdown(rowIndex: number) {
    const row = this.tableRows.nth(rowIndex);
    const moreBtn = row.locator("button").last();
    await moreBtn.click();
  }

  async clickDropdownAction(action: string) {
    await this.page.getByRole("menuitem", { name: action }).click();
  }

  async confirmAction() {
    const dialog = this.page.locator(".fixed.z-50.bg-background");
    await dialog.waitFor({ state: "visible" });
    const actionBtn = dialog.getByRole("button").last();
    await actionBtn.click();
  }

  rowCount() {
    return this.tableRows.count();
  }
}
