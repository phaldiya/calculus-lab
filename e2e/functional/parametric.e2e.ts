import { expect, test } from '../fixtures/app.fixture';

test.describe('Parametric & Polar', () => {
  test.beforeEach(async ({ calcPage }) => {
    await calcPage.goToTab('parametric');
  });

  test('plotting a 2D parametric curve adds it to the list and renders chart', async ({ calcPage, page }) => {
    await page.getByLabel('X expression').fill('cos(t)');
    await page.getByLabel('Y expression').fill('sin(t)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    // Equation appears in list
    await expect(page.getByText('(cos(t), sin(t))').first()).toBeVisible();

    // Badge shows 2D
    await expect(page.getByText('2D').first()).toBeVisible();

    // Plotly chart rendered
    await calcPage.waitForPlotly();
    await expect(page.locator('.js-plotly-plot')).toBeVisible();
  });

  test('switching to polar mode shows r(theta) input', async ({ page }) => {
    await page.getByRole('radio', { name: 'Polar' }).click();
    await expect(page.getByLabel('Polar expression')).toBeVisible();
  });

  test('plotting a polar curve shows polar badge', async ({ page }) => {
    await page.getByRole('radio', { name: 'Polar' }).click();
    await page.getByLabel('Polar expression').fill('2 + cos(3*theta)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await expect(page.getByText('r = 2 + cos(3*theta)').first()).toBeVisible();
    await expect(page.getByText('polar').first()).toBeVisible();
  });

  test('toggle and remove work for parametric equations', async ({ page }) => {
    await page.getByLabel('X expression').fill('t');
    await page.getByLabel('Y expression').fill('t^2');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    const toggle = page.getByRole('switch', { name: /\(t, t\^2\)/ });
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    await page.getByLabel(/Remove \(t, t\^2\)/).click();
    await expect(page.getByText('No curves yet')).toBeVisible();
  });

  test('Clear All resets to empty state', async ({ page }) => {
    await page.getByLabel('X expression').fill('cos(t)');
    await page.getByLabel('Y expression').fill('sin(t)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await page.getByRole('button', { name: 'Clear All' }).click();
    await expect(page.getByText('No curves yet')).toBeVisible();
  });
});
