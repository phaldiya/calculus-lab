import { test as base, expect, type Page } from '@playwright/test';

type Tab =
  | 'scientific'
  | 'graphing'
  | '3d-graphing'
  | 'calculus'
  | 'matrix'
  | 'statistics'
  | 'parametric'
  | 'manipulate';

export class CalcPage {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async goToTab(tab: Tab) {
    await this.page.goto(`/calculus-lab/#/${tab}`, { waitUntil: 'domcontentloaded' });
    // Hash navigation doesn't trigger network requests, so wait for React to
    // render tab-specific content instead of relying on networkidle.
    const readyLocators: Record<Tab, import('@playwright/test').Locator> = {
      scientific: this.page.getByRole('button', { name: 'AC' }),
      graphing: this.page.getByLabel('Function expression'),
      '3d-graphing': this.page.getByLabel('3D surface expression'),
      calculus: this.page.getByLabel('Derivative expression'),
      matrix: this.page.getByText('Matrix Calculator'),
      statistics: this.page.getByText('Data Input'),
      parametric: this.page.getByText('Parametric & Polar'),
      manipulate: this.page.getByText('Interact'),
    };
    await readyLocators[tab].first().waitFor({ state: 'visible', timeout: 15000 });
  }

  async waitForPlotly() {
    // Wait for Suspense "Loading graph..." to disappear (if present)
    const loading = this.page.getByText('Loading graph...');
    if (await loading.isVisible({ timeout: 500 }).catch(() => false)) {
      await loading.waitFor({ state: 'detached', timeout: 10000 });
    }
    // Wait for Plotly container to appear
    await this.page.locator('.js-plotly-plot .plot-container').first().waitFor({ state: 'attached', timeout: 10000 });
    // For 2D charts, wait for gridlines to render (Plotly draws axes asynchronously)
    // 3D charts use WebGL and don't have SVG gridlayer elements
    const gridline = this.page.locator('.js-plotly-plot .gridlayer path').first();
    await gridline.waitFor({ state: 'attached', timeout: 3000 }).catch(() => {});
    // Settle buffer for Plotly rendering
    await this.page.waitForTimeout(1000);
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
