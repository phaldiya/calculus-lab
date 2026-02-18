import { test as base, expect, type Page } from '@playwright/test';

type Tab = 'scientific' | 'graphing' | '3d-graphing' | 'calculus' | 'matrix' | 'statistics';

export class CalcPage {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async goToTab(tab: Tab) {
    await this.page.goto(`/calculus-lab/#/${tab}`);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForPlotly() {
    // Wait for Suspense "Loading graph..." to disappear (if present)
    const loading = this.page.getByText('Loading graph...');
    if (await loading.isVisible({ timeout: 500 }).catch(() => false)) {
      await loading.waitFor({ state: 'detached', timeout: 10000 });
    }
    // Wait for Plotly container to appear
    await this.page.locator('.js-plotly-plot .plot-container').first().waitFor({ state: 'attached', timeout: 10000 });
    // Settle buffer for Plotly rendering
    await this.page.waitForTimeout(800);
  }

  async enableDarkMode() {
    const html = this.page.locator('html');
    if (!(await html.evaluate((el) => el.classList.contains('dark')))) {
      await this.page.getByLabel('Switch to dark mode').click();
    }
    await expect(html).toHaveClass(/dark/);
  }

  async ensureLightMode() {
    const html = this.page.locator('html');
    if (await html.evaluate((el) => el.classList.contains('dark'))) {
      await this.page.getByLabel('Switch to light mode').click();
    }
    await expect(html).not.toHaveClass(/dark/);
  }

  async stableScreenshot(name: string) {
    // Inject CSS to zero out animation/transition durations
    await this.page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });
    // Wait for Plotly if a plot is present
    const hasPlotly = await this.page.locator('.js-plotly-plot').count();
    if (hasPlotly > 0) {
      await this.waitForPlotly();
    }
    await expect(this.page).toHaveScreenshot(name);
  }
}

export const test = base.extend<{ calcPage: CalcPage }>({
  calcPage: async ({ page, baseURL }, use) => {
    // Clear localStorage before each test to prevent state bleed
    // Navigate to the origin first so we can access localStorage
    await page.goto(baseURL ?? '/calculus-lab/');
    await page.evaluate(() => window.localStorage.removeItem('calculus-lab-state'));
    const calcPage = new CalcPage(page);
    await use(calcPage);
  },
});

export { expect };
