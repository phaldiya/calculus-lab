import { expect, test } from '../fixtures/app.fixture';

test.describe('Scientific Calculator', () => {
  test.beforeEach(async ({ calcPage }) => {
    await calcPage.goToTab('scientific');
  });

  test('basic arithmetic: 5 * 3 = 15', async ({ page }) => {
    await page.getByRole('button', { name: '5', exact: true }).click();
    await page.getByRole('button', { name: '×', exact: true }).click();
    await page.getByRole('button', { name: '3', exact: true }).click();
    await page.getByRole('button', { name: '=', exact: true }).click();

    const display = page.locator('output[aria-live="polite"] .text-3xl');
    await expect(display).toHaveText('15');
  });

  test('scientific function: sin(pi) = 0', async ({ page }) => {
    await page.getByRole('button', { name: 'sin', exact: true }).click();
    await page.getByRole('button', { name: 'π' }).click();
    await page.getByRole('button', { name: ')', exact: true }).click();
    await page.getByRole('button', { name: '=', exact: true }).click();

    const display = page.locator('output[aria-live="polite"] .text-3xl');
    await expect(display).toHaveText('0');
  });

  test('AC clears display to 0', async ({ page }) => {
    await page.getByRole('button', { name: '5', exact: true }).click();
    await page.getByRole('button', { name: '×', exact: true }).click();
    await page.getByRole('button', { name: '3', exact: true }).click();

    await page.getByRole('button', { name: 'AC', exact: true }).click();

    const display = page.locator('output[aria-live="polite"] .text-3xl');
    await expect(display).toHaveText('0');
  });

  test('Deg/Rad toggle switches angle mode', async ({ page }) => {
    // Default is Rad
    await expect(page.locator('text=Rad').first()).toBeVisible();

    // Click Deg button to switch
    await page.getByRole('button', { name: 'Toggle degrees/radians' }).click();
    await expect(page.locator('text=Deg').first()).toBeVisible();

    // Click Rad button to switch back
    await page.getByRole('button', { name: 'Toggle degrees/radians' }).click();
    await expect(page.locator('text=Rad').first()).toBeVisible();
  });

  test('memory: 5, =, m+, AC, mr → display "5"', async ({ page }) => {
    await page.getByRole('button', { name: '5', exact: true }).click();
    await page.getByRole('button', { name: '=', exact: true }).click();
    await page.getByRole('button', { name: 'Memory add' }).click();
    await page.getByRole('button', { name: 'AC', exact: true }).click();
    await page.getByRole('button', { name: 'Memory recall' }).click();

    const display = page.locator('output[aria-live="polite"] .text-3xl');
    await expect(display).toHaveText('5');
  });

  test('Show Steps button appears after computation', async ({ page }) => {
    await page.getByRole('button', { name: '5', exact: true }).click();
    await page.getByRole('button', { name: '+', exact: true }).click();
    await page.getByRole('button', { name: '3', exact: true }).click();
    await page.getByRole('button', { name: '=', exact: true }).click();

    await expect(page.getByRole('button', { name: 'Show Steps' })).toBeVisible();
  });

  test('2nd toggle shows alternate functions', async ({ page }) => {
    // Click 2nd button
    await page.getByRole('button', { name: 'Toggle second functions' }).click();

    // sin should become sin⁻¹
    await expect(page.getByRole('button', { name: 'Inverse sine' })).toBeVisible();
    // sinh should become sinh⁻¹
    await expect(page.getByRole('button', { name: 'Inverse hyperbolic sine' })).toBeVisible();

    // Toggle back
    await page.getByRole('button', { name: 'Toggle second functions' }).click();

    // sin should be visible again
    await expect(page.getByRole('button', { name: 'sin', exact: true })).toBeVisible();
    // sinh should be visible again
    await expect(page.getByRole('button', { name: 'sinh', exact: true })).toBeVisible();
  });

  test('hyperbolic function: sinh(0) = 0', async ({ page }) => {
    await page.getByRole('button', { name: 'sinh', exact: true }).click();
    await page.getByRole('button', { name: '0', exact: true }).click();
    await page.getByRole('button', { name: ')', exact: true }).click();
    await page.getByRole('button', { name: '=', exact: true }).click();

    const display = page.locator('output[aria-live="polite"] .text-3xl');
    await expect(display).toHaveText('0');
  });

  test('cube root via ³√x: cbrt(27) = 3', async ({ page }) => {
    await page.getByRole('button', { name: 'Cube root' }).click();
    await page.getByRole('button', { name: '2', exact: true }).click();
    await page.getByRole('button', { name: '7', exact: true }).click();
    await page.getByRole('button', { name: ')', exact: true }).click();
    await page.getByRole('button', { name: '=', exact: true }).click();

    const display = page.locator('output[aria-live="polite"] .text-3xl');
    await expect(display).toHaveText('3');
  });

  test('Rand inserts a random number', async ({ page }) => {
    await page.getByRole('button', { name: 'Random number' }).click();

    const display = page.locator('output[aria-live="polite"] .text-3xl');
    const text = await display.textContent();
    const num = parseFloat(text ?? '');
    expect(num).toBeGreaterThanOrEqual(0);
    expect(num).toBeLessThan(1);
  });
});
