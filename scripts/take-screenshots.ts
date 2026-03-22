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

  const plotExpression = async (expr: string) => {
    const input = await page.$('input[aria-label="Expression"]');
    if (input) {
      await input.click({ clickCount: 3 });
      await input.type(expr);
      await page.click('button[type="submit"]');
      await new Promise((r) => setTimeout(r, 500));
    }
  };

  const zoomPlot = async (xRange: [number, number], yRange: [number, number]) => {
    await page.evaluate(
      (xr, yr) => {
        const plot = document.querySelector('.js-plotly-plot');
        // biome-ignore lint/suspicious/noExplicitAny: Plotly is loaded globally in the browser context
        const Plotly = (window as any).Plotly;
        if (plot && Plotly) {
          Plotly.relayout(plot, {
            'xaxis.autorange': false,
            'xaxis.range': xr,
            'yaxis.autorange': false,
            'yaxis.range': yr,
            'yaxis.scaleanchor': null,
          });
        }
      },
      xRange,
      yRange,
    );
    await new Promise((r) => setTimeout(r, 1500));
  };

  // --- Scientific tab ---
  await page.goto(`${BASE}/scientific`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));

  const sciInput = await page.$('input[type="text"]');
  if (sciInput) {
    await sciInput.type('sin(45)');
  }
  await clickBtn('=');
  await new Promise((r) => setTimeout(r, 500));

  await page.screenshot({ path: 'public/docs/scientific-tab.png' });
  console.log('Captured scientific tab');

  // --- Graph tab - 2D functions ---
  await freshPage('graph');
  await page.waitForSelector('input[aria-label="Expression"]');

  const graphExpressions = ['sin(x)', 'x^3 - 2*x + 1', 'exp(-x^2)', 'log(x)', 'sqrt(x)', 'sin(x) * exp(-x/5)'];
  for (const expr of graphExpressions) {
    await plotExpression(expr);
  }
  await new Promise((r) => setTimeout(r, 1000));
  await zoomPlot([-8, 8], [-4, 4]);

  await page.screenshot({ path: 'public/docs/graph-tab.png' });
  console.log('Captured graph tab');

  // --- Graph tab - 3D surfaces ---
  await freshPage('graph');
  await page.waitForSelector('input[aria-label="Expression"]');

  const threeDExpressions = ['sin(x) * cos(y)', 'exp(-(x^2 + y^2))', 'x^2 - y^2', 'sin(sqrt(x^2 + y^2))'];
  for (const expr of threeDExpressions) {
    await plotExpression(expr);
  }
  await new Promise((r) => setTimeout(r, 2000));

  await page.screenshot({ path: 'public/docs/3d-tab.png' });
  console.log('Captured 3D graphing');

  // --- Calculus tab ---
  await page.goto(`${BASE}/calculus`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));

  const calcInputs = await page.$$('input[type="text"]');
  await calcInputs[0].type('x^3');
  await clickBtn('d/dx');
  await new Promise((r) => setTimeout(r, 500));

  const integralInputs = await page.$$('.flex.flex-col.gap-2 input[type="text"]');
  if (integralInputs.length >= 4) {
    await integralInputs[1].type('x^2');
    await integralInputs[2].type('0');
    await integralInputs[3].type('1');
  }
  await clickBtn('Compute');
  await new Promise((r) => setTimeout(r, 500));

  const limitInputs = await page.$$('input[placeholder*="sin(x)/x"], input[placeholder*="x ->"]');
  if (limitInputs.length >= 2) {
    await limitInputs[0].type('sin(x)/x');
    await limitInputs[1].type('0');
  }
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

  // --- Matrix tab ---
  await page.goto(`${BASE}/matrix`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));

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

  // --- Stats tab ---
  await page.goto(`${BASE}/statistics`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));

  const textarea = await page.$('textarea');
  if (textarea) {
    await textarea.type('2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 5, 7, 11, 13, 15');
  }
  await new Promise((r) => setTimeout(r, 2000));

  await page.screenshot({ path: 'public/docs/stats-tab.png' });
  console.log('Captured stats tab');

  // --- Graph tab - 2D parametric curves (semicolon syntax) ---
  await freshPage('graph');
  await page.waitForSelector('input[aria-label="Expression"]');

  await plotExpression('cos(t); sin(t)');
  await plotExpression('sin(3*t); sin(2*t)');
  await plotExpression('t*cos(t); t*sin(t)');
  await plotExpression('t - sin(t); 1 - cos(t)');
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({ path: 'public/docs/parametric-tab.png' });
  console.log('Captured parametric curves');

  // --- Graph tab - 3D parametric curves ---
  await freshPage('graph');
  await page.waitForSelector('input[aria-label="Expression"]');

  await plotExpression('cos(t); sin(t); t / 5');
  await plotExpression('sin(t) + 2*sin(2*t); cos(t) - 2*cos(2*t); -sin(3*t)');
  await plotExpression('(2+cos(5*t))*cos(t); (2+cos(5*t))*sin(t); sin(5*t)');
  await new Promise((r) => setTimeout(r, 2000));

  await page.screenshot({ path: 'public/docs/parametric-3d-tab.png' });
  console.log('Captured parametric 3D curves');

  // --- Graph tab - Polar plots ---
  await freshPage('graph');
  await page.waitForSelector('input[aria-label="Expression"]');

  await plotExpression('1 + cos(theta)');
  await plotExpression('cos(3 * theta)');
  await plotExpression('theta / (2*pi)');
  await plotExpression('sqrt(abs(cos(2*theta)))');
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({ path: 'public/docs/parametric-polar-tab.png' });
  console.log('Captured polar plots');

  // --- Graph tab - Interactive sliders ---
  await freshPage('graph');
  await page.waitForSelector('input[aria-label="Expression"]');

  await plotExpression('a * sin(b * x)');
  await new Promise((r) => setTimeout(r, 500));

  // Adjust slider a to 3
  const sliderA = await page.$('input[aria-label="a slider"]');
  if (sliderA) {
    await sliderA.evaluate((el) => {
      (el as HTMLInputElement).value = '3';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }
  await new Promise((r) => setTimeout(r, 300));

  // Adjust slider b to 2
  const sliderB = await page.$('input[aria-label="b slider"]');
  if (sliderB) {
    await sliderB.evaluate((el) => {
      (el as HTMLInputElement).value = '2';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }
  await new Promise((r) => setTimeout(r, 300));

  await plotExpression('k * x^2');
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({ path: 'public/docs/manipulate-tab.png' });
  console.log('Captured interactive sliders');

  // --- Custom points screenshot ---
  await freshPage('graph');
  await page.waitForSelector('input[aria-label="Expression"]');

  // Click "+ Plot custom points" to expand form
  await clickBtn('+ Plot custom points');
  await new Promise((r) => setTimeout(r, 300));

  // Fill in label
  const labelInput = await page.$('input[aria-label="Dataset label"]');
  if (labelInput) await labelInput.type('Sample Data');

  // Fill in some points
  const pointInputs = await page.$$('input[placeholder="x"], input[placeholder="y"]');
  const points = [
    [1, 2],
    [2, 4],
    [3, 3],
    [4, 7],
    [5, 5],
  ];
  for (let i = 0; i < points.length; i++) {
    if (i > 0) await clickBtn('+ Add Row');
    await new Promise((r) => setTimeout(r, 200));
    const xInputs = await page.$$('input[placeholder="x"]');
    const yInputs = await page.$$('input[placeholder="y"]');
    if (xInputs[i] && yInputs[i]) {
      await xInputs[i].type(String(points[i][0]));
      await yInputs[i].type(String(points[i][1]));
    }
  }

  await clickBtn('Plot Points');
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({ path: 'public/docs/custom-points.png' });
  console.log('Captured custom points');

  // --- Dark mode screenshot ---
  await freshPage('graph');
  await page.waitForSelector('input[aria-label="Expression"]');

  await plotExpression('sin(x)');
  await plotExpression('x^2 - 3');
  await new Promise((r) => setTimeout(r, 500));

  // Toggle dark mode
  const darkModeBtn = await page.$('button[aria-label*="dark mode"], button[aria-label*="light mode"]');
  if (darkModeBtn) await darkModeBtn.click();
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({ path: 'public/docs/dark-mode.png' });
  console.log('Captured dark mode');

  // Toggle back to light
  const lightModeBtn = await page.$('button[aria-label*="dark mode"], button[aria-label*="light mode"]');
  if (lightModeBtn) await lightModeBtn.click();
  await new Promise((r) => setTimeout(r, 500));

  // --- Responsive screenshots ---

  // Desktop graphing (1280px)
  await page.setViewport({ width: 1280, height: 900 });
  await freshPage('graph');
  await page.waitForSelector('input[aria-label="Expression"]');

  for (const expr of graphExpressions) {
    await plotExpression(expr);
  }
  await new Promise((r) => setTimeout(r, 1000));
  await zoomPlot([-8, 8], [-4, 4]);

  await page.screenshot({ path: 'public/docs/desktop-graphing.png' });
  console.log('Captured desktop graphing');

  // Tablet graphing (768px)
  await page.setViewport({ width: 768, height: 1024 });
  await freshPage('graph');
  await page.waitForSelector('input[aria-label="Expression"]');

  for (const expr of graphExpressions) {
    await plotExpression(expr);
  }
  await new Promise((r) => setTimeout(r, 1000));
  await zoomPlot([-8, 8], [-4, 4]);

  await page.screenshot({ path: 'public/docs/tablet-graphing.png' });
  console.log('Captured tablet graphing');

  // Mobile screenshots (375px)
  await page.setViewport({ width: 375, height: 812 });

  await page.goto(`${BASE}/scientific`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.localStorage.removeItem('calculus-lab-state'));
  await page.reload({ waitUntil: 'networkidle0' });

  // Mobile scientific
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: 'public/docs/mobile-scientific.png' });
  console.log('Captured mobile scientific');

  // Mobile graphing
  await freshPage('graph');
  await page.waitForSelector('input[aria-label="Expression"]');

  for (const expr of ['sin(x)', 'x^2', 'log(x)']) {
    await plotExpression(expr);
  }
  await new Promise((r) => setTimeout(r, 1000));
  await zoomPlot([-8, 8], [-4, 4]);

  await page.screenshot({ path: 'public/docs/mobile-graphing.png' });
  console.log('Captured mobile graphing');

  // Mobile 3D
  await freshPage('graph');
  await page.waitForSelector('input[aria-label="Expression"]');

  await plotExpression('sin(x) * cos(y)');
  await plotExpression('x^2 - y^2');
  await new Promise((r) => setTimeout(r, 2000));

  await page.screenshot({ path: 'public/docs/mobile-3d.png' });
  console.log('Captured mobile 3D');

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

  // Mobile matrix
  await page.goto(`${BASE}/matrix`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: 'public/docs/mobile-matrix.png' });
  console.log('Captured mobile matrix');

  // Mobile drawer (history panel)
  await page.goto(`${BASE}/scientific`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));

  const historyToggles = await page.$$('header button[aria-label*="history"], header button[aria-label*="History"]');
  let clicked = false;
  for (const toggle of historyToggles) {
    const isVisible = await toggle.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    if (isVisible) {
      await toggle.click();
      clicked = true;
      break;
    }
  }
  if (!clicked) {
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
