import type { Data, Layout } from 'plotly.js-dist-min';
import { useMemo } from 'react';

import { useAppContext } from '../../context/AppContext';
import { evaluateOverRange } from '../../lib/expressionParser';
import PlotlyWrapper from '../../lib/PlotlyWrapper';
import { make2DBaseLayout, make2DXAxis, make2DYAxis, useCenteredAxes } from '../../lib/plotTheme';

export default function CalculusPlot() {
  const { state } = useAppContext();
  const { xRange, yRange, xAxisPos, yAxisPos, onRelayout } = useCenteredAxes();
  const {
    derivativeExpr,
    derivativeResult,
    integralExpr,
    integralLower,
    integralUpper,
    limitExpr,
    limitPoint,
    limitResult,
  } = state.calculus;

  const data = useMemo(() => {
    const traces: Data[] = [];

    // Plot original function if derivative was computed (indigo)
    if (derivativeExpr) {
      try {
        const result = evaluateOverRange(derivativeExpr, -10, 10);
        traces.push({
          x: result.x,
          y: result.y,
          type: 'scatter',
          mode: 'lines',
          name: `f(x) = ${derivativeExpr}`,
          line: { color: '#6366f1', width: 2 },
        });
      } catch {
        /* skip */
      }
    }

    // Plot derivative (indigo dashed)
    if (derivativeResult) {
      try {
        const result = evaluateOverRange(derivativeResult, -10, 10);
        traces.push({
          x: result.x,
          y: result.y,
          type: 'scatter',
          mode: 'lines',
          name: `f'(x) = ${derivativeResult}`,
          line: { color: '#6366f1', width: 2, dash: 'dash' },
        });
      } catch {
        /* skip */
      }
    }

    // Plot integral area (emerald)
    if (integralExpr && integralLower && integralUpper) {
      try {
        const lower = parseFloat(integralLower);
        const upper = parseFloat(integralUpper);
        if (Number.isFinite(lower) && Number.isFinite(upper)) {
          const result = evaluateOverRange(integralExpr, lower, upper, 200);
          traces.push({
            x: [lower, ...result.x, upper],
            y: [0, ...result.y, 0],
            type: 'scatter',
            mode: 'lines',
            name: 'Area',
            fill: 'tozeroy',
            fillcolor: 'rgba(16, 185, 129, 0.2)',
            line: { color: '#10b981', width: 1 },
          });

          // Also plot the full function
          const full = evaluateOverRange(integralExpr, -10, 10);
          traces.unshift({
            x: full.x,
            y: full.y,
            type: 'scatter',
            mode: 'lines',
            name: `f(x) = ${integralExpr}`,
            line: { color: '#10b981', width: 2 },
          });
        }
      } catch {
        /* skip */
      }
    }

    // Plot limit function and marker (amber)
    if (limitExpr && limitPoint && limitResult) {
      try {
        const point = parseFloat(limitPoint);
        const result = parseFloat(limitResult);
        if (Number.isFinite(point) && Number.isFinite(result)) {
          const evalResult = evaluateOverRange(limitExpr, point - 5, point + 5);
          traces.push({
            x: evalResult.x,
            y: evalResult.y,
            type: 'scatter',
            mode: 'lines',
            name: `f(x) = ${limitExpr}`,
            line: { color: '#f59e0b', width: 2 },
          });

          traces.push({
            x: [point],
            y: [result],
            type: 'scatter',
            mode: 'markers',
            name: `limit = ${limitResult}`,
            marker: { color: '#f59e0b', size: 10, symbol: 'circle' },
          });
        }
      } catch {
        /* skip */
      }
    }

    return traces;
  }, [
    derivativeExpr,
    derivativeResult,
    integralExpr,
    integralLower,
    integralUpper,
    limitExpr,
    limitPoint,
    limitResult,
  ]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      ...make2DBaseLayout(state.darkMode, { showlegend: true }),
      xaxis: make2DXAxis(state.darkMode, { range: xRange, position: xAxisPos }),
      yaxis: make2DYAxis(state.darkMode, { range: yRange, position: yAxisPos }),
    }),
    [state.darkMode, xRange, yRange, xAxisPos, yAxisPos],
  );

  if (data.length === 0) {
    return (
      <div className="relative h-full w-full">
        <PlotlyWrapper data={[]} layout={layout} style={{ width: '100%', height: '100%' }} onRelayout={onRelayout} />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-lg bg-[var(--color-surface)] px-4 py-2 text-[var(--color-text-secondary)] text-sm opacity-60">
            Compute a derivative, integral, or limit to see the graph
          </span>
        </div>
      </div>
    );
  }

  return (
    <PlotlyWrapper data={data} layout={layout} style={{ width: '100%', height: '100%' }} onRelayout={onRelayout} />
  );
}
