import type { Data, Layout } from 'plotly.js-dist-min';
import { useMemo } from 'react';

import { useAppContext } from '../../context/AppContext';
import { evaluateOverGrid, evaluateOverRange, parseImplicitEquation } from '../../lib/expressionParser';
import PlotlyWrapper from '../../lib/PlotlyWrapper';
import type { Variable } from '../../types';

export default function ManipulatePlot() {
  const { state } = useAppContext();
  const { equations, sliders, xRange, yRange, gridResolution } = state.manipulate;

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
      autosize: true,
      margin: { l: 50, r: 20, t: 20, b: 40 },
      xaxis: {
        zeroline: true,
        zerolinecolor: '#94a3b8',
        gridcolor: state.darkMode ? '#334155' : '#e2e8f0',
        color: state.darkMode ? '#94a3b8' : '#64748b',
        range: [xRange[0], xRange[1]],
      },
      yaxis: {
        zeroline: true,
        zerolinecolor: '#94a3b8',
        gridcolor: state.darkMode ? '#334155' : '#e2e8f0',
        color: state.darkMode ? '#94a3b8' : '#64748b',
        scaleanchor: 'x',
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      showlegend: data.length > 1,
      legend: {
        x: 0,
        y: 1,
        bgcolor: 'transparent',
        font: { color: state.darkMode ? '#e2e8f0' : '#1e293b', size: 11 },
      },
      dragmode: 'pan',
      hovermode: 'closest',
    }),
    [data.length, state.darkMode, xRange],
  );

  return (
    <div className="relative h-full w-full">
      <PlotlyWrapper data={data} layout={layout} style={{ width: '100%', height: '100%' }} />
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
