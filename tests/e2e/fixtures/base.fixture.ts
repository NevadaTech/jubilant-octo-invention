import { test as base } from "@playwright/test";
import { SidebarPage } from "../pages/sidebar.page";

type Fixtures = {
  sidebar: SidebarPage;
};

export const test = base.extend<Fixtures>({
  sidebar: async ({ page }, use) => {
    await use(new SidebarPage(page));
  },
});

export { expect } from "@playwright/test";
