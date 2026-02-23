import { expect, test } from '../fixtures/app.fixture';

test.describe('Interactive Manipulate', () => {
  test.beforeEach(async ({ calcPage }) => {
    await calcPage.goToTab('manipulate');
  });

  test('plotting an equation adds it to the list and renders chart', async ({ calcPage, page }) => {
    const input = page.getByLabel('Manipulate expression');
    await input.fill('sin(x)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await expect(page.getByText('sin(x)').first()).toBeVisible();

    await calcPage.waitForPlotly();
    await expect(page.locator('.js-plotly-plot')).toBeVisible();
  });

  test('entering expression with parameter auto-creates slider', async ({ page }) => {
    const input = page.getByLabel('Manipulate expression');
    await input.fill('a * sin(x)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    // Slider for parameter 'a' should appear
    await expect(page.getByLabel('a slider')).toBeVisible();
  });

  test('slider adjusts equation parameter', async ({ calcPage, page }) => {
    const input = page.getByLabel('Manipulate expression');
    await input.fill('a * sin(x)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await calcPage.waitForPlotly();

    // Move slider
    const slider = page.getByLabel('a slider');
    await slider.fill('3');

    // Plot should still be visible (re-rendered with new value)
    await expect(page.locator('.js-plotly-plot')).toBeVisible();
  });

  test('toggle and remove work for manipulate equations', async ({ page }) => {
    const input = page.getByLabel('Manipulate expression');
    await input.fill('x^2');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    const toggle = page.getByRole('switch', { name: /x\^2/ });
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    await page.getByLabel('Remove x^2').click();
    await expect(page.getByText('No equations yet')).toBeVisible();
  });

  test('Clear All resets everything', async ({ page }) => {
    const input = page.getByLabel('Manipulate expression');
    await input.fill('a * x^2');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await page.getByRole('button', { name: 'Clear All' }).click();
    await expect(page.getByText('No equations yet')).toBeVisible();
  });

  test('manually adding a slider works', async ({ page }) => {
    const paramInput = page.getByLabel('Slider parameter name');
    await paramInput.fill('k');
    await page.getByRole('button', { name: 'Add' }).click();

    await expect(page.getByText('k =').first()).toBeVisible();
  });
});
