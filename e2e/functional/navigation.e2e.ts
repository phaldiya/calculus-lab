import { expect, test } from '../fixtures/app.fixture';

test.describe('Navigation', () => {
  test('redirects / to /#/scientific', async ({ calcPage, page }) => {
    // The fixture already navigated to /calculus-lab/ which triggers redirect
    await calcPage.goToTab('scientific');
    await expect(page).toHaveURL(/\/#\/scientific/);
  });

  test('clicking each sidebar tab navigates to correct panel', async ({ calcPage, page }) => {
    await calcPage.goToTab('scientific');

    const tabs = [
      { label: 'Graph', path: '/graphing', heading: 'Equations' },
      { label: '3D', path: '/3d-graphing', heading: '3D Surfaces' },
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

  test('dark mode persists across tab navigation', async ({ calcPage, page }) => {
    await calcPage.goToTab('scientific');
    await calcPage.enableDarkMode();
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Navigate to other tabs — dark mode should remain active
    await page.getByRole('tab', { name: 'Graph' }).first().click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.getByRole('tab', { name: 'Stats' }).first().click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
