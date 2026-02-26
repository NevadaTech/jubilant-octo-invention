import { type Page, type Locator } from "@playwright/test";
import { waitForTableLoad } from "../helpers/wait-helpers";

export class StockPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly tableRows: Locator;
  readonly lowStockButton: Locator;
  readonly summaryRow: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder(/search/i);
    this.tableRows = page.locator("tbody tr");
    this.lowStockButton = page.getByRole("button", { name: /low stock/i });
    this.summaryRow = page.locator("tfoot tr");
  }

  async goto() {
    await this.page.goto("/en/dashboard/inventory/stock", {
      waitUntil: "domcontentloaded",
    });
  }

  async waitForLoad() {
    await waitForTableLoad(this.page);
  }

  rowCount() {
    return this.tableRows.count();
  }
}
