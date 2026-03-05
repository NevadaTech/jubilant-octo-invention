import { type Page, type Locator } from "@playwright/test";
import { waitForContentLoad } from "../helpers/wait-helpers";

export class CompaniesPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly newButton: Locator;
  readonly tableRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder(/search/i);
    this.newButton = page.getByRole("button", { name: /new/i });
    this.tableRows = page.locator("tbody tr");
  }

  async goto() {
    await this.page.goto("/en/dashboard/inventory/companies", {
      waitUntil: "domcontentloaded",
    });
  }

  async waitForLoad() {
    await waitForContentLoad(this.page);
  }

  async clickNew() {
    await this.newButton.click();
    // Wait for the dialog form fields to appear (more reliable than role/data-state)
    await this.page
      .locator("#name")
      .waitFor({ state: "visible", timeout: 10_000 });
  }

  async fillForm(name: string, code: string, description?: string) {
    await this.page.locator("#name").fill(name);
    await this.page.locator("#code").fill(code);
    if (description) {
      await this.page.locator("#description").fill(description);
    }
  }

  async submitForm() {
    // The Create/Save button is inside the dialog
    await this.page.getByRole("button", { name: /^create$|^save$/i }).click();
  }

  async openRowDropdown(rowIndex: number) {
    const row = this.tableRows.nth(rowIndex);
    const moreBtn = row.locator("button").last();
    await moreBtn.click();
  }

  async clickDropdownAction(action: string | RegExp) {
    await this.page.getByRole("menuitem", { name: action }).click();
  }

  async confirmDelete() {
    // Wait for the confirmation dialog to appear (shadcn AlertDialog)
    // Use text-based detection since role="alertdialog" may not always match
    const deleteBtn = this.page.getByRole("button", { name: /^delete$/i });
    await deleteBtn.waitFor({ state: "visible", timeout: 10_000 });
    await deleteBtn.click();
  }

  rowCount() {
    return this.tableRows.count();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(1000);
  }

  async isEmptyState(): Promise<boolean> {
    return this.page
      .getByText(/no companies/i)
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
  }
}

/**
 * Helper to interact with the Global Company Selector in the header.
 * The selector is a native <select> with aria-label="Select company" and opacity-0.
 * It overlays a styled button showing the selected company name.
 */
export class GlobalCompanySelectorHelper {
  readonly page: Page;
  readonly select: Locator;
  readonly button: Locator;

  constructor(page: Page) {
    this.page = page;
    // Target specifically the company selector by its aria-label
    this.select = page.locator('select[aria-label="Select company"]');
    this.button = page.locator("button.pointer-events-none").first();
  }

  async waitForReady(timeout = 10_000) {
    // Wait for the companies data to load so options are populated
    await this.select.waitFor({ state: "attached", timeout }).catch(() => {});
    await this.page.waitForTimeout(1000);
  }

  async isVisible(): Promise<boolean> {
    // The select is opacity-0 but still in DOM. Check if it's attached.
    await this.waitForReady();
    const attached = await this.select.count();
    return attached > 0;
  }

  async selectCompanyByIndex(index: number) {
    await this.waitForReady();
    await this.select.selectOption({ index });
    await this.page.waitForTimeout(1000);
  }

  async selectAll() {
    await this.waitForReady();
    await this.select.selectOption("");
    await this.page.waitForTimeout(1000);
  }

  async getSelectedText(): Promise<string> {
    await this.waitForReady();
    return (await this.button.textContent({ timeout: 10_000 })) || "";
  }

  async getOptionCount(): Promise<number> {
    await this.waitForReady();
    return this.select.locator("option").count();
  }
}
