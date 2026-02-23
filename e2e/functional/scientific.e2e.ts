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

  test('RAD/DEG toggle changes aria-pressed', async ({ page }) => {
    const radBtn = page.getByRole('button', { name: 'RAD' });
    const degBtn = page.getByRole('button', { name: 'DEG' });

    await expect(radBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(degBtn).toHaveAttribute('aria-pressed', 'false');

    await degBtn.click();
    await expect(degBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(radBtn).toHaveAttribute('aria-pressed', 'false');
  });

  test('memory: 5, =, M+, AC, MR → display "5"', async ({ page }) => {
    await page.getByRole('button', { name: '5', exact: true }).click();
    await page.getByRole('button', { name: '=', exact: true }).click();
    await page.getByRole('button', { name: 'M+' }).click();
    await page.getByRole('button', { name: 'AC', exact: true }).click();
    await page.getByRole('button', { name: 'MR' }).click();

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
});
