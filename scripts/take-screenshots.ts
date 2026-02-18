import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'http://localhost:5000/calculus-lab/#';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--window-size=1400,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const freshPage = async (route: string) => {
    await page.evaluate(() => window.localStorage.removeItem('calculus-lab-state'));
    await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle0' });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));
  };

  const clickBtn = async (text: string) => {
    const btns = await page.$$('button');
    for (const btn of btns) {
      const t = await btn.evaluate((el) => el.textContent?.trim());
      if (t === text) {
        await btn.click();
        return;
      }
    }
  };

  // Scientific tab
  await page.goto(`${BASE}/scientific`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));

  // Type a calculation to show the calculator in action
  const sciInput = await page.$('input[type="text"]');
  if (sciInput) {
    await sciInput.type('sin(45)');
  }
  await clickBtn('=');
  await new Promise((r) => setTimeout(r, 500));

  await page.screenshot({ path: 'public/docs/scientific-tab.png' });
  console.log('Captured scientific tab');

  // Graph tab - plot all 6 documented expressions
  await page.goto(`${BASE}/graphing`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('input[placeholder*="sin"]');

  const graphExpressions = ['sin(x)', 'x^3 - 2*x + 1', 'exp(-x^2)', 'log(x)', 'sqrt(x)', 'sin(x) * exp(-x/5)'];
  for (const expr of graphExpressions) {
    await page.type('input[placeholder*="sin"]', expr);
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 500));
  }
  await new Promise((r) => setTimeout(r, 1000));

  // Zoom to a range where all 6 curves are visible (cubic dominates at default zoom)
  // Remove scaleanchor so y-range isn't overridden by aspect-ratio constraint
  await page.evaluate(() => {
    const plot = document.querySelector('.js-plotly-plot');
    // biome-ignore lint/suspicious/noExplicitAny: Plotly is loaded globally in the browser context
    const Plotly = (window as any).Plotly;
    if (plot && Plotly) {
      Plotly.relayout(plot, {
        'xaxis.autorange': false,
        'xaxis.range': [-8, 8],
        'yaxis.autorange': false,
        'yaxis.range': [-4, 4],
        'yaxis.scaleanchor': null,
      });
    }
  });
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({ path: 'public/docs/graph-tab.png' });
  console.log('Captured graph tab');

  // 3D Graphing tab - plot all 4 documented expressions (colors auto-assigned)
  await freshPage('3d-graphing');

  const threeDExpressions = ['sin(x) * cos(y)', 'exp(-(x^2 + y^2))', 'x^2 - y^2', 'sin(sqrt(x^2 + y^2))'];
  for (const expr of threeDExpressions) {
    await page.type('input[aria-label="3D surface expression"]', expr);
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 500));
  }
  await new Promise((r) => setTimeout(r, 2000));

  await page.screenshot({ path: 'public/docs/3d-tab.png' });
  console.log('Captured 3D graphing tab');

  // Calculus tab
  await page.goto(`${BASE}/calculus`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));

  // Compute derivative of x^3
  const calcInputs = await page.$$('input[type="text"]');
  await calcInputs[0].type('x^3');
  await clickBtn('d/dx');
  await new Promise((r) => setTimeout(r, 500));

  // Compute integral of x^2 from 0 to 1
  const integralInputs = await page.$$('.flex.flex-col.gap-2 input[type="text"]');
  if (integralInputs.length >= 4) {
    await integralInputs[1].type('x^2');
    await integralInputs[2].type('0');
    await integralInputs[3].type('1');
  }

  // Click first Compute button for integral
  await clickBtn('Compute');
  await new Promise((r) => setTimeout(r, 500));

  // Compute limit of sin(x)/x as x->0
  const limitInputs = await page.$$('input[placeholder*="sin(x)/x"], input[placeholder*="x ->"]');
  if (limitInputs.length >= 2) {
    await limitInputs[0].type('sin(x)/x');
    await limitInputs[1].type('0');
  }

  // Click second Compute button for limit
  const computeBtns = await page.$$('button');
  let computeCount = 0;
  for (const btn of computeBtns) {
    const text = await btn.evaluate((el) => el.textContent?.trim());
    if (text === 'Compute') {
      computeCount++;
      if (computeCount === 2) {
        await btn.click();
        break;
      }
    }
  }
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({ path: 'public/docs/calculus-tab.png' });
  console.log('Captured calculus tab');

  // Matrix tab
  await page.goto(`${BASE}/matrix`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));

  // Fill matrix A with [[1,2],[3,4]]
  const matrixInputs = await page.$$('input[type="number"]');
  if (matrixInputs.length >= 4) {
    await matrixInputs[0].click({ clickCount: 3 });
    await matrixInputs[0].type('1');
    await matrixInputs[1].click({ clickCount: 3 });
    await matrixInputs[1].type('2');
    await matrixInputs[2].click({ clickCount: 3 });
    await matrixInputs[2].type('3');
    await matrixInputs[3].click({ clickCount: 3 });
    await matrixInputs[3].type('4');
  }

  await clickBtn('det(A)');
  await new Promise((r) => setTimeout(r, 300));
  await clickBtn('Compute');
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({ path: 'public/docs/matrix-tab.png' });
  console.log('Captured matrix tab');

  // Stats tab
  await page.goto(`${BASE}/statistics`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));

  const textarea = await page.$('textarea');
  if (textarea) {
    await textarea.type('2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 5, 7, 11, 13, 15');
  }
  await new Promise((r) => setTimeout(r, 2000));

  await page.screenshot({ path: 'public/docs/stats-tab.png' });
  console.log('Captured stats tab');

  // Dark mode screenshot - go to graphing and toggle
  await freshPage('graphing');

  // Toggle dark mode via header button
  const headerBtns = await page.$$('header button');
  if (headerBtns.length > 0) {
    await headerBtns[0].click();
  }
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({ path: 'public/docs/dark-mode.png' });
  console.log('Captured dark mode');

  // Toggle dark mode back to light
  const headerBtns2 = await page.$$('header button');
  if (headerBtns2.length > 0) {
    await headerBtns2[0].click();
  }
  await new Promise((r) => setTimeout(r, 500));

  // --- Responsive screenshots ---

  // Desktop graphing (1280px) - plot all 6 expressions with zoom
  await page.setViewport({ width: 1280, height: 900 });
  await freshPage('graphing');
  await page.waitForSelector('input[placeholder*="sin"]');

  for (const expr of graphExpressions) {
    await page.type('input[placeholder*="sin"]', expr);
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 500));
  }
  await new Promise((r) => setTimeout(r, 1000));

  await page.evaluate(() => {
    const plot = document.querySelector('.js-plotly-plot');
    // biome-ignore lint/suspicious/noExplicitAny: Plotly is loaded globally in the browser context
    const Plotly = (window as any).Plotly;
    if (plot && Plotly) {
      Plotly.relayout(plot, {
        'xaxis.autorange': false,
        'xaxis.range': [-8, 8],
        'yaxis.autorange': false,
        'yaxis.range': [-4, 4],
        'yaxis.scaleanchor': null,
      });
    }
  });
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({ path: 'public/docs/desktop-graphing.png' });
  console.log('Captured desktop graphing');

  // Tablet graphing (768px) - plot all 6 expressions with zoom
  await page.setViewport({ width: 768, height: 1024 });
  await freshPage('graphing');
  await page.waitForSelector('input[placeholder*="sin"]');

  for (const expr of graphExpressions) {
    await page.type('input[placeholder*="sin"]', expr);
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 500));
  }
  await new Promise((r) => setTimeout(r, 1000));

  await page.evaluate(() => {
    const plot = document.querySelector('.js-plotly-plot');
    // biome-ignore lint/suspicious/noExplicitAny: Plotly is loaded globally in the browser context
    const Plotly = (window as any).Plotly;
    if (plot && Plotly) {
      Plotly.relayout(plot, {
        'xaxis.autorange': false,
        'xaxis.range': [-8, 8],
        'yaxis.autorange': false,
        'yaxis.range': [-4, 4],
        'yaxis.scaleanchor': null,
      });
    }
  });
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({ path: 'public/docs/tablet-graphing.png' });
  console.log('Captured tablet graphing');

  // Mobile screenshots (375px)
  await page.setViewport({ width: 375, height: 812 });

  // Clear localStorage so mobile screenshots show clean empty states
  await page.goto(`${BASE}/scientific`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.localStorage.removeItem('calculus-lab-state'));
  await page.reload({ waitUntil: 'networkidle0' });

  // Mobile scientific
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: 'public/docs/mobile-scientific.png' });
  console.log('Captured mobile scientific');

  // Mobile graphing - add equations so the plot isn't empty
  await freshPage('graphing');
  await page.waitForSelector('input[placeholder*="sin"]');

  const mobileGraphExpressions = ['sin(x)', 'x^2', 'log(x)'];
  for (const expr of mobileGraphExpressions) {
    await page.type('input[placeholder*="sin"]', expr);
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 500));
  }
  await new Promise((r) => setTimeout(r, 1000));

  await page.evaluate(() => {
    const plot = document.querySelector('.js-plotly-plot');
    // biome-ignore lint/suspicious/noExplicitAny: Plotly is loaded globally in the browser context
    const Plotly = (window as any).Plotly;
    if (plot && Plotly) {
      Plotly.relayout(plot, {
        'xaxis.autorange': false,
        'xaxis.range': [-8, 8],
        'yaxis.autorange': false,
        'yaxis.range': [-4, 4],
        'yaxis.scaleanchor': null,
      });
    }
  });
  await new Promise((r) => setTimeout(r, 1000));

  await page.screenshot({ path: 'public/docs/mobile-graphing.png' });
  console.log('Captured mobile graphing');

  // Mobile calculus
  await page.goto(`${BASE}/calculus`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: 'public/docs/mobile-calculus.png' });
  console.log('Captured mobile calculus');

  // Mobile statistics
  await page.goto(`${BASE}/statistics`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: 'public/docs/mobile-statistics.png' });
  console.log('Captured mobile statistics');

  // Mobile 3D - add equations so the plot isn't empty
  await freshPage('3d-graphing');

  const mobile3DExpressions = ['sin(x) * cos(y)', 'x^2 - y^2'];
  for (const expr of mobile3DExpressions) {
    await page.type('input[aria-label="3D surface expression"]', expr);
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 500));
  }
  await new Promise((r) => setTimeout(r, 2000));

  await page.screenshot({ path: 'public/docs/mobile-3d.png' });
  console.log('Captured mobile 3D');

  // Mobile drawer - open the right panel drawer
  await page.goto(`${BASE}/scientific`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));

  // Click the panel toggle button in the header to open the drawer
  const panelToggle = await page.$(
    'header button[aria-label*="panel"], header button[aria-label*="Panel"], header button[aria-label*="sidebar"], header button[aria-label*="Sidebar"]',
  );
  if (panelToggle) {
    await panelToggle.click();
  } else {
    // Fallback: try the last button in header (usually the panel toggle)
    const allHeaderBtns = await page.$$('header button');
    if (allHeaderBtns.length > 1) {
      await allHeaderBtns[allHeaderBtns.length - 1].click();
    }
  }
  await new Promise((r) => setTimeout(r, 1000));

  await page.screenshot({ path: 'public/docs/mobile-drawer.png' });
  console.log('Captured mobile drawer');

  await browser.close();
  console.log('All screenshots captured!');
}

main().catch(console.error);
