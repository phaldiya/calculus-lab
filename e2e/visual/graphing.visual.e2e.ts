import { test } from '../fixtures/app.fixture';

test.describe('Graph Visual', () => {
  test('empty state, light mode', async ({ calcPage }) => {
    await calcPage.goToTab('graph');
    await calcPage.ensureLightMode();
    await calcPage.stableScreenshot('graphing-empty-light.png');
  });

  test('empty state, dark mode', async ({ calcPage }) => {
    await calcPage.goToTab('graph');
    await calcPage.enableDarkMode();
    await calcPage.stableScreenshot('graphing-empty-dark.png');
  });

  test('populated state, light mode', async ({ calcPage, page }) => {
    await calcPage.goToTab('graph');
    await calcPage.ensureLightMode();

    const input = page.getByLabel('Expression');

    await input.fill('sin(x)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await input.fill('x^2');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await input.fill('cos(x)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await calcPage.stableScreenshot('graphing-populated-light.png');
  });

  test('populated state, dark mode', async ({ calcPage, page }) => {
    await calcPage.goToTab('graph');
    await calcPage.enableDarkMode();

    const input = page.getByLabel('Expression');

    await input.fill('sin(x)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await input.fill('x^2');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await input.fill('cos(x)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await calcPage.stableScreenshot('graphing-populated-dark.png');
  });
});
