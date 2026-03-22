import { expect, test } from '../fixtures/app.fixture';

test.describe('Navigation', () => {
  test('redirects / to /#/scientific', async ({ calcPage, page }) => {
    await calcPage.goToTab('scientific');
    await expect(page).toHaveURL(/\/#\/scientific/);
  });

  test('clicking each sidebar tab navigates to correct panel', async ({ calcPage, page }) => {
    await calcPage.goToTab('scientific');

    const tabs = [
      { label: 'Graph', path: '/graph', heading: 'Graph' },
      { label: 'Calculus', path: '/calculus', heading: 'Derivative' },
      { label: 'Matrix', path: '/matrix', heading: 'Matrix Calculator' },
      { label: 'Stats', path: '/statistics', heading: 'Data Input' },
      { label: 'Calc', path: '/scientific', button: 'AC' },
    ] as const;

    for (const tab of tabs) {
      await page.getByRole('tab', { name: tab.label }).first().click();
      await expect(page).toHaveURL(new RegExp(`#${tab.path}`));
      if ('heading' in tab) {
        await expect(page.getByText(tab.heading).first()).toBeVisible();
      }
      if ('button' in tab) {
        await expect(page.getByRole('button', { name: tab.button }).first()).toBeVisible();
      }
    }
  });

  test('dark mode toggle adds and removes .dark class', async ({ calcPage, page }) => {
    await calcPage.goToTab('scientific');
    await calcPage.ensureLightMode();

    await calcPage.enableDarkMode();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await calcPage.ensureLightMode();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('right panel toggle shows and hides history sidebar', async ({ calcPage, page }) => {
    await calcPage.goToTab('scientific');

    // Desktop aside panel defaults to closed (w-0)
    const aside = page.locator('aside[aria-label="History"]');
    await expect(aside).toHaveCSS('width', '0px');

    // Click toggle to show
    await page.getByLabel('Show history').click();
    await page.waitForTimeout(300);
    const width = await aside.evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeGreaterThan(0);

    // Click toggle to hide
    await page.getByLabel('Hide history').click();
    await page.waitForTimeout(300);
    await expect(aside).toHaveCSS('width', '0px');
  });

  test('dark mode persists across tab navigation', async ({ calcPage, page }) => {
    await calcPage.goToTab('scientific');
    await calcPage.enableDarkMode();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.getByRole('tab', { name: 'Graph' }).first().click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.getByRole('tab', { name: 'Stats' }).first().click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('old routes redirect to /graph', async ({ page }) => {
    await page.goto('/calculus-lab/#/graphing');
    await expect(page).toHaveURL(/\/#\/graph$/);

    await page.goto('/calculus-lab/#/3d-graphing');
    await expect(page).toHaveURL(/\/#\/graph$/);

    await page.goto('/calculus-lab/#/parametric');
    await expect(page).toHaveURL(/\/#\/graph$/);

    await page.goto('/calculus-lab/#/manipulate');
    await expect(page).toHaveURL(/\/#\/graph$/);
  });
});
