import { type Page, type Locator } from "@playwright/test";
import { waitForTableLoad } from "../helpers/wait-helpers";

export class CategoriesPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly newButton: Locator;
  readonly tableRows: Locator;
  readonly table: Locator;

  // Form fields
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly formModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder(/search/i);
    this.newButton = page.getByRole("button", { name: /new/i });
    this.table = page.locator("table");
    this.tableRows = page.locator("tbody tr");
    this.nameInput = page.locator("#name");
    this.descriptionInput = page.locator("#description");
    this.formModal = page.locator(".fixed.inset-0.z-50");
  }

  async goto() {
    await this.page.goto("/en/dashboard/inventory/categories", {
      waitUntil: "domcontentloaded",
    });
  }

  async waitForLoad() {
    await waitForTableLoad(this.page);
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500);
    await waitForTableLoad(this.page);
  }

  async clickNew() {
    await this.newButton.click();
    await this.formModal.waitFor({ state: "visible" });
  }

  async fillForm(name: string, description?: string) {
    await this.nameInput.fill(name);
    if (description) {
      await this.descriptionInput.fill(description);
    }
  }

  async submitForm() {
    const submitBtn = this.formModal.getByRole("button", {
      name: /create|save/i,
    });
    await submitBtn.click();
  }

  async openRowActions(rowIndex: number) {
    const row = this.tableRows.nth(rowIndex);
    const moreBtn = row.locator("button").last();
    await moreBtn.click();
  }

  async clickDropdownAction(action: string) {
    await this.page.getByRole("menuitem", { name: action }).click();
  }

  async confirmDelete() {
    // Custom AlertDialog renders as fixed div (no role="alertdialog")
    // Find the "Delete" button that appears in the confirmation dialog
    const deleteBtn = this.page
      .locator(".fixed.z-50")
      .getByRole("button", { name: /^delete$/i });
    await deleteBtn.waitFor({ state: "visible", timeout: 5_000 });
    await deleteBtn.click();
  }

  rowCount() {
    return this.tableRows.count();
  }
}
