import { type Page, type Locator } from "@playwright/test";
import { waitForTableLoad } from "../helpers/wait-helpers";

export class ProductsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly newButton: Locator;
  readonly tableRows: Locator;
  readonly paginationText: Locator;
  readonly nextPageBtn: Locator;
  readonly prevPageBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder(/search/i);
    this.newButton = page.getByRole("button", { name: /new/i });
    this.tableRows = page.locator("tbody tr");
    this.paginationText = page.locator("text=/Showing/i");
    // Pagination uses ChevronRight/ChevronLeft icon buttons (no text)
    // They appear after the "page / totalPages" text
    this.nextPageBtn = page.locator("button:has(svg.lucide-chevron-right)");
    this.prevPageBtn = page.locator("button:has(svg.lucide-chevron-left)");
  }

  async goto() {
    await this.page.goto("/en/dashboard/inventory/products", {
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

  async clickProduct(index: number) {
    const link = this.tableRows.nth(index).locator("a").first();
    await link.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async toggleStatus() {
    const toggleBtn = this.page.getByRole("button", {
      name: /activate|deactivate/i,
    });
    await toggleBtn.click();
    const dialog = this.page.locator(".fixed.z-50.bg-background");
    await dialog.waitFor({ state: "visible" });
    await dialog
      .getByRole("button", { name: /confirm|activate|deactivate/i })
      .click();
  }

  rowCount() {
    return this.tableRows.count();
  }
}
