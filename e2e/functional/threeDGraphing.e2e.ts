import { expect, test } from '../fixtures/app.fixture';

test.describe('3D Graphing', () => {
  test.beforeEach(async ({ calcPage }) => {
    await calcPage.goToTab('3d-graphing');
  });

  test('plotting a 3D equation adds it to the list and renders chart', async ({ calcPage, page }) => {
    const input = page.getByLabel('3D surface expression');
    await input.fill('sin(x) * cos(y)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    // Equation appears in list
    await expect(page.getByText('sin(x) * cos(y)').first()).toBeVisible();

    // Plotly chart rendered
    await calcPage.waitForPlotly();
    await expect(page.locator('.js-plotly-plot')).toBeVisible();
  });

  test('plotting multiple 3D equations shows all in list', async ({ page }) => {
    const input = page.getByLabel('3D surface expression');

    await input.fill('sin(x) * cos(y)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await input.fill('x^2 - y^2');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await expect(page.getByText('sin(x) * cos(y)').first()).toBeVisible();
    await expect(page.getByText('x^2 - y^2').first()).toBeVisible();
  });

  test('removing a 3D equation clears the list', async ({ page }) => {
    const input = page.getByLabel('3D surface expression');
    await input.fill('sin(x) * cos(y)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await page.getByLabel('Remove sin(x) * cos(y)').click();

    await expect(page.getByText('No surfaces yet')).toBeVisible();
  });

  test('toggling visibility switch flips aria-checked', async ({ page }) => {
    const input = page.getByLabel('3D surface expression');
    await input.fill('sin(x) * cos(y)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    const toggle = page.getByRole('switch', { name: /sin\(x\) \* cos\(y\)/ });
    await expect(toggle).toHaveAttribute('aria-checked', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  test('Clear All resets to empty state', async ({ page }) => {
    const input = page.getByLabel('3D surface expression');

    await input.fill('sin(x) * cos(y)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await input.fill('x^2 - y^2');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await page.getByRole('button', { name: 'Clear All' }).click();

    await expect(page.getByText('No surfaces yet')).toBeVisible();
  });
});
