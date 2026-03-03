import type { Data, Layout } from 'plotly.js-dist-min';
import { useMemo } from 'react';

import { useAppContext } from '../../context/AppContext';
import { evaluateOverGrid, evaluateOverRange, parseImplicitEquation } from '../../lib/expressionParser';
import PlotlyWrapper from '../../lib/PlotlyWrapper';
import { make2DBaseLayout, make2DXAxis, make2DYAxis, useCenteredAxes } from '../../lib/plotTheme';
import type { Variable } from '../../types';

export default function ManipulatePlot() {
  const { state } = useAppContext();
  const { equations, sliders, xRange, yRange, gridResolution } = state.manipulate;
  const { xRange: liveXRange, yRange: liveYRange, xAxisPos, yAxisPos, onRelayout } = useCenteredAxes();

  // Merge global variables with slider values (sliders take precedence)
  const mergedVariables = useMemo<Variable[]>(() => {
    const varMap = new Map<string, number>();
    for (const v of state.variables) {
      varMap.set(v.name, v.value);
    }
    for (const s of sliders) {
      varMap.set(s.name, s.value);
    }
    return Array.from(varMap.entries()).map(([name, value]) => ({ name, value }));
  }, [state.variables, sliders]);

  const data = useMemo(() => {
    const traces: Data[] = [];

    for (const eq of equations) {
      if (!eq.visible) continue;
      try {
        if (eq.plotType === 'implicit') {
          const rearranged = parseImplicitEquation(eq.expression);
          if (!rearranged) continue;
          const grid = evaluateOverGrid(
            rearranged,
            xRange[0],
            xRange[1],
            yRange[0],
            yRange[1],
            gridResolution,
            gridResolution,
            mergedVariables,
          );
          traces.push({
            x: grid.x,
            y: grid.y,
            z: grid.z,
            type: 'contour',
            name: eq.expression,
            showlegend: true,
            contours: { type: 'constraint', operation: '=', value: 0 },
            line: { color: eq.color, width: 2 },
            showscale: false,
            hoverinfo: 'x+y',
          });
        } else {
          const result = evaluateOverRange(eq.expression, xRange[0], xRange[1], 500, mergedVariables);
          traces.push({
            x: result.x,
            y: result.y,
            type: 'scatter',
            mode: 'lines',
            name: eq.expression,
            line: { color: eq.color, width: 2 },
            hoverinfo: 'x+y',
          });
        }
      } catch {
        // Skip invalid equations
      }
    }

    return traces;
  }, [equations, mergedVariables, xRange, yRange, gridResolution]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      ...make2DBaseLayout(state.darkMode, {
        showlegend: data.length > 1,
        hovermode: 'closest',
      }),
      xaxis: make2DXAxis(state.darkMode, { range: liveXRange, position: xAxisPos }),
      yaxis: make2DYAxis(state.darkMode, { range: liveYRange, position: yAxisPos }),
    }),
    [data.length, state.darkMode, liveXRange, liveYRange, xAxisPos, yAxisPos],
  );

  return (
    <div className="relative h-full w-full">
      <PlotlyWrapper data={data} layout={layout} style={{ width: '100%', height: '100%' }} onRelayout={onRelayout} />
      {data.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-lg bg-[var(--color-surface)] px-4 py-2 text-[var(--color-text-secondary)] text-sm opacity-60">
            Add an equation with parameters, then adjust sliders
          </span>
        </div>
      )}
    </div>
  );
}
