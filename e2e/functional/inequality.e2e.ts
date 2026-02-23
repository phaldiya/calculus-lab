import { expect, test } from '../fixtures/app.fixture';

test.describe('Inequality Plotting', () => {
  test.beforeEach(async ({ calcPage }) => {
    await calcPage.goToTab('graphing');
  });

  test('plotting an inequality adds it to the list with badge', async ({ calcPage, page }) => {
    const input = page.getByLabel('Function expression');
    await input.fill('y > x^2');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    // Equation appears in list
    await expect(page.getByText('y > x^2').first()).toBeVisible();

    // Inequality badge shows operator
    await expect(page.getByText('>').first()).toBeVisible();

    // Plotly chart rendered
    await calcPage.waitForPlotly();
    await expect(page.locator('.js-plotly-plot')).toBeVisible();
  });

  test('plotting a <= inequality shows correct badge', async ({ page }) => {
    const input = page.getByLabel('Function expression');
    await input.fill('y <= sin(x)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await expect(page.getByText('y <= sin(x)').first()).toBeVisible();
    await expect(page.getByText('<=').first()).toBeVisible();
  });

  test('toggle and remove work for inequality equations', async ({ page }) => {
    const input = page.getByLabel('Function expression');
    await input.fill('x^2 + y^2 < 25');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    // Toggle visibility
    const toggle = page.getByRole('switch', { name: /x\^2 \+ y\^2 < 25/ });
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    // Remove
    await page.getByLabel('Remove x^2 + y^2 < 25').click();
    await expect(page.getByText('No equations yet')).toBeVisible();
  });

  test('invalid inequality shows error', async ({ page }) => {
    const input = page.getByLabel('Function expression');
    await input.fill('y > x^^2');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await expect(page.getByRole('alert')).toBeVisible();
  });
});
