import { test as base, expect, type Page } from '@playwright/test';

type Tab = 'scientific' | 'graph' | 'calculus' | 'matrix' | 'statistics';

const TABS_WITH_PLOTLY: ReadonlySet<Tab> = new Set(['graph', 'calculus', 'statistics']);

export class CalcPage {
  private page: Page;
  private currentTab: Tab | null = null;
  constructor(page: Page) {
    this.page = page;
  }

  async goToTab(tab: Tab) {
    await this.page.goto(`/calculus-lab/#/${tab}`, { waitUntil: 'domcontentloaded' });
    const readyLocators: Record<Tab, import('@playwright/test').Locator> = {
      scientific: this.page.getByRole('button', { name: 'AC' }),
      graph: this.page.getByLabel('Expression'),
      calculus: this.page.getByLabel('Derivative expression'),
      matrix: this.page.getByText('Matrix Calculator'),
      statistics: this.page.getByText('Data Input'),
    };
    await readyLocators[tab].first().waitFor({ state: 'visible', timeout: 15000 });
    this.currentTab = tab;
  }

  async waitForPlotly() {
    // Race the Suspense fallback and the plot container — whichever appears
    // first proves the lazy chunk is in-flight / resolved, so the subsequent
    // waits are meaningful. Under cold-start load either can win.
    const loading = this.page.getByText('Loading graph...');
    const plotContainer = this.page.locator('.js-plotly-plot').first();
    await Promise.race([
      loading.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
      plotContainer.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {}),
    ]);
    if (await loading.isVisible().catch(() => false)) {
      await loading.waitFor({ state: 'detached', timeout: 15000 });
    }
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
    if (this.currentTab !== null && TABS_WITH_PLOTLY.has(this.currentTab)) {
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
