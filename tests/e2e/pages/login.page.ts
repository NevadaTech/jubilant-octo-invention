import { type Page, type Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly orgSlugInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.orgSlugInput = page.locator("#organizationSlug");
    this.emailInput = page.locator("#email");
    this.passwordInput = page.locator("#password");
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator(".text-destructive");
  }

  async goto() {
    await this.page.goto("/en/login");
  }

  async login(org: string, email: string, password: string) {
    await this.orgSlugInput.fill(org);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async waitForRedirectToDashboard() {
    await this.page.waitForURL("**/dashboard", { timeout: 15_000 });
  }
}
