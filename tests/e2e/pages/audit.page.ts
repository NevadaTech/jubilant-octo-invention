import { type Page, type Locator } from "@playwright/test";
import { waitForTableLoad } from "../helpers/wait-helpers";

export class AuditPage {
  readonly page: Page;
  readonly tableRows: Locator;
  readonly exportButton: Locator;
  readonly detailDialog: Locator;
  readonly paginationText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tableRows = page.locator("tbody tr");
    this.exportButton = page.getByRole("button", { name: /export|excel/i });
    this.detailDialog = page.locator('[role="dialog"]');
    this.paginationText = page.locator("text=/Showing/i");
  }

  async goto() {
    await this.page.goto("/en/dashboard/audit", {
      waitUntil: "domcontentloaded",
    });
  }

  async waitForLoad() {
    await waitForTableLoad(this.page);
  }

  async clickRow(index: number) {
    await this.tableRows.nth(index).click();
  }

  async closeDetailDialog() {
    const closeBtn = this.detailDialog.locator("button").first();
    await closeBtn.click();
  }

  rowCount() {
    return this.tableRows.count();
  }
}
