import { test } from '../fixtures/app.fixture';

test.describe('Statistics Visual', () => {
  test('empty state, light mode', async ({ calcPage }) => {
    await calcPage.goToTab('statistics');
    await calcPage.ensureLightMode();
    await calcPage.waitForPlotly();
    await calcPage.stableScreenshot('statistics-empty-light.png');
  });

  test('empty state, dark mode', async ({ calcPage }) => {
    await calcPage.goToTab('statistics');
    await calcPage.enableDarkMode();
    await calcPage.waitForPlotly();
    await calcPage.stableScreenshot('statistics-empty-dark.png');
  });

  test('populated state, light mode', async ({ calcPage, page }) => {
    await calcPage.goToTab('statistics');
    await calcPage.ensureLightMode();

    await page.getByLabel('Data values').fill('10, 20, 30, 40, 50, 25, 35');
    await calcPage.waitForPlotly();

    await calcPage.stableScreenshot('statistics-populated-light.png');
  });

  test('populated state, dark mode', async ({ calcPage, page }) => {
    await calcPage.goToTab('statistics');
    await calcPage.enableDarkMode();

    await page.getByLabel('Data values').fill('10, 20, 30, 40, 50, 25, 35');
    await calcPage.waitForPlotly();

    await calcPage.stableScreenshot('statistics-populated-dark.png');
  });
});
