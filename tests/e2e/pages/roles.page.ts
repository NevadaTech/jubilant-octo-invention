import { type Page, type Locator } from "@playwright/test";
import { waitForTableLoad } from "../helpers/wait-helpers";

export class RolesPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly newButton: Locator;
  readonly tableRows: Locator;
  readonly formModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder(/search/i);
    this.newButton = page.getByRole("button", { name: /new|create/i });
    this.tableRows = page.locator("tbody tr");
    this.formModal = page.locator(".fixed.inset-0.z-50");
  }

  async goto() {
    await this.page.goto("/en/dashboard/roles", {
      waitUntil: "domcontentloaded",
    });
  }

  async waitForLoad() {
    await waitForTableLoad(this.page);
  }

  async clickNew() {
    await this.newButton.click();
    await this.formModal.waitFor({ state: "visible" });
  }

  async openRowDropdown(rowIndex: number) {
    const row = this.tableRows.nth(rowIndex);
    const moreBtn = row.locator("button").last();
    await moreBtn.click();
  }

  async clickDropdownAction(action: string) {
    await this.page.getByRole("menuitem", { name: action }).click();
  }

  async confirmDelete() {
    const dialog = this.page.locator(".fixed.z-50.bg-background");
    await dialog.waitFor({ state: "visible" });
    await dialog.getByRole("button", { name: /delete|confirm/i }).click();
  }

  rowCount() {
    return this.tableRows.count();
  }
}
