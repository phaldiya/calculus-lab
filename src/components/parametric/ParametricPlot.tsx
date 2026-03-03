import type { Data, Layout } from 'plotly.js-dist-min';
import { useMemo } from 'react';

import { useAppContext } from '../../context/AppContext';
import { evaluateParametric2D, evaluateParametric3D, evaluatePolar } from '../../lib/expressionParser';
import PlotlyWrapper from '../../lib/PlotlyWrapper';
import {
  make2DBaseLayout,
  make2DXAxis,
  make2DYAxis,
  make3DAxis,
  makePolarAxis,
  useCenteredAxes,
} from '../../lib/plotTheme';

export default function ParametricPlot() {
  const { state } = useAppContext();
  const { xRange, yRange, xAxisPos, yAxisPos, onRelayout } = useCenteredAxes();

  const data = useMemo(() => {
    const traces: Data[] = [];

    for (const eq of state.parametric.equations) {
      if (!eq.visible) continue;
      try {
        if (eq.plotType === 'polar') {
          const result = evaluatePolar(eq.xExpr, eq.tMin, eq.tMax, eq.numPoints, state.variables);
          traces.push({
            r: result.r,
            theta: result.theta,
            type: 'scatterpolar',
            mode: 'lines',
            name: `r = ${eq.xExpr}`,
            line: { color: eq.color, width: 2 },
          });
        } else if (eq.plotType === 'parametric-3d') {
          const result = evaluateParametric3D(
            eq.xExpr,
            eq.yExpr,
            eq.zExpr || '0',
            eq.tMin,
            eq.tMax,
            eq.numPoints,
            state.variables,
          );
          traces.push({
            x: result.x,
            y: result.y,
            z: result.z,
            type: 'scatter3d',
            mode: 'lines',
            name: `(${eq.xExpr}, ${eq.yExpr}, ${eq.zExpr})`,
            line: { color: eq.color, width: 3 },
          });
        } else {
          const result = evaluateParametric2D(eq.xExpr, eq.yExpr, eq.tMin, eq.tMax, eq.numPoints, state.variables);
          traces.push({
            x: result.x,
            y: result.y,
            type: 'scatter',
            mode: 'lines',
            name: `(${eq.xExpr}, ${eq.yExpr})`,
            line: { color: eq.color, width: 2 },
            hoverinfo: 'x+y',
          });
        }
      } catch {
        // Skip invalid equations
      }
    }

    return traces;
  }, [state.parametric.equations, state.variables]);

  const is3D = data.some((t) => t.type === 'scatter3d');
  const isPolar = data.some((t) => t.type === 'scatterpolar');

  const layout = useMemo<Partial<Layout>>(
    () => ({
      ...make2DBaseLayout(state.darkMode, { showlegend: data.length > 1 }),
      ...(isPolar
        ? { polar: makePolarAxis(state.darkMode) }
        : is3D
          ? {
              scene: {
                xaxis: make3DAxis(state.darkMode),
                yaxis: make3DAxis(state.darkMode),
                zaxis: make3DAxis(state.darkMode),
              },
            }
          : {
              xaxis: make2DXAxis(state.darkMode, { range: xRange, position: xAxisPos }),
              yaxis: make2DYAxis(state.darkMode, { range: yRange, position: yAxisPos }),
            }),
    }),
    [data.length, state.darkMode, is3D, isPolar, xRange, yRange, xAxisPos, yAxisPos],
  );

  return (
    <div className="relative h-full w-full">
      <PlotlyWrapper data={data} layout={layout} style={{ width: '100%', height: '100%' }} onRelayout={onRelayout} />
      {data.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-lg bg-[var(--color-surface)] px-4 py-2 text-[var(--color-text-secondary)] text-sm opacity-60">
            Add a parametric or polar curve to see the plot
          </span>
        </div>
      )}
    </div>
  );
}
