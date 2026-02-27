import { type Page, type Locator } from "@playwright/test";
import { waitForTableLoad } from "../helpers/wait-helpers";

export class WarehousesPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly newButton: Locator;
  readonly tableRows: Locator;
  readonly codeInput: Locator;
  readonly nameInput: Locator;
  readonly addressInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder(/search/i);
    // "New Warehouse" is a Link styled as Button
    this.newButton = page.getByRole("link", { name: /new/i });
    this.tableRows = page.locator("tbody tr");
    this.codeInput = page.locator("#code");
    this.nameInput = page.locator("#name");
    this.addressInput = page.locator("#address");
  }

  async goto() {
    await this.page.goto("/en/dashboard/inventory/warehouses", {
      waitUntil: "domcontentloaded",
    });
  }

  async waitForLoad() {
    await waitForTableLoad(this.page);
  }

  async clickNew() {
    await this.newButton.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async fillForm(code: string, name: string, address?: string) {
    await this.codeInput.fill(code);
    await this.nameInput.fill(name);
    if (address) {
      await this.addressInput.fill(address);
    }
  }

  async submitForm() {
    const submitBtn = this.page.getByRole("button", {
      name: /create|save/i,
    });
    await submitBtn.click();
  }

  rowCount() {
    return this.tableRows.count();
  }
}
