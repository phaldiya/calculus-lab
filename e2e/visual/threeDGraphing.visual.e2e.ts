import { test } from '../fixtures/app.fixture';

test.describe('3D Graphing Visual', () => {
  test('empty state, light mode', async ({ calcPage }) => {
    await calcPage.goToTab('3d-graphing');
    await calcPage.ensureLightMode();
    await calcPage.stableScreenshot('3d-graphing-empty-light.png');
  });

  test('empty state, dark mode', async ({ calcPage }) => {
    await calcPage.goToTab('3d-graphing');
    await calcPage.enableDarkMode();
    await calcPage.stableScreenshot('3d-graphing-empty-dark.png');
  });

  test('populated state, light mode', async ({ calcPage, page }) => {
    await calcPage.goToTab('3d-graphing');
    await calcPage.ensureLightMode();

    const input = page.getByLabel('3D surface expression');

    await input.fill('sin(x) * cos(y)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await calcPage.stableScreenshot('3d-graphing-populated-light.png');
  });

  test('populated state, dark mode', async ({ calcPage, page }) => {
    await calcPage.goToTab('3d-graphing');
    await calcPage.enableDarkMode();

    const input = page.getByLabel('3D surface expression');

    await input.fill('sin(x) * cos(y)');
    await page.getByRole('button', { name: 'Plot', exact: true }).click();

    await calcPage.stableScreenshot('3d-graphing-populated-dark.png');
  });
});
