import { expect, test } from '../fixtures/app.fixture';

test.describe('Unified Graph', () => {
  test.beforeEach(async ({ calcPage }) => {
    await calcPage.goToTab('graph');
  });

  test('plotting an equation adds it to the list and renders chart', async ({ calcPage, page }) => {
    const input = page.getByLabel('Expression');
    await input.fill('sin(x)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await expect(page.getByText('sin(x)').first()).toBeVisible();

    await calcPage.waitForPlotly();
    await expect(page.locator('.js-plotly-plot')).toBeVisible();
  });

  test('plotting multiple equations shows all in list', async ({ page }) => {
    const input = page.getByLabel('Expression');

    await input.fill('sin(x)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await input.fill('x^2');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await expect(page.getByText('sin(x)').first()).toBeVisible();
    await expect(page.getByText('x^2').first()).toBeVisible();
  });

  test('removing an equation clears the list', async ({ page }) => {
    const input = page.getByLabel('Expression');
    await input.fill('sin(x)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await page.getByLabel('Remove sin(x)').click();

    await expect(page.getByText('No equations yet')).toBeVisible();
  });

  test('toggling visibility switch flips aria-checked', async ({ page }) => {
    const input = page.getByLabel('Expression');
    await input.fill('sin(x)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    const toggle = page.getByRole('switch', { name: /sin\(x\)/ });
    await expect(toggle).toHaveAttribute('aria-checked', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  test('auto-detects implicit equation type', async ({ page }) => {
    const input = page.getByLabel('Expression');
    await input.fill('x^2+y^2=25');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await expect(page.getByText('implicit').first()).toBeVisible();
  });

  test('auto-detects 3D surface type', async ({ calcPage, page }) => {
    const input = page.getByLabel('Expression');
    await input.fill('sin(x)*cos(y)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await expect(page.getByText('3D').first()).toBeVisible();
    await calcPage.waitForPlotly();
  });

  test('auto-creates sliders for parameter expressions', async ({ page }) => {
    const input = page.getByLabel('Expression');
    await input.fill('a*sin(x)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    // Slider for parameter 'a' should appear
    await expect(page.getByLabel('a slider')).toBeVisible();
  });

  test('Clear All removes all equations', async ({ page }) => {
    const input = page.getByLabel('Expression');
    await input.fill('sin(x)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await page.getByRole('button', { name: 'Clear All' }).click();

    await expect(page.getByText('No equations yet')).toBeVisible();
  });
});
