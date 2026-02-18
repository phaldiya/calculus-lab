import type { Data, Layout } from 'plotly.js-dist-min';
import { useMemo } from 'react';

import { useAppContext } from '../../context/AppContext';
import { evaluateOverGrid } from '../../lib/expressionParser';
import PlotlyWrapper from '../../lib/PlotlyWrapper';

export default function ThreeDPlot() {
  const { state } = useAppContext();
  const { equations, xRange, yRange, gridResolution } = state.threeDGraphing;

  const data = useMemo(() => {
    const traces: Data[] = [];

    for (const eq of equations) {
      if (!eq.visible) continue;
      try {
        const grid = evaluateOverGrid(
          eq.expression,
          xRange[0],
          xRange[1],
          yRange[0],
          yRange[1],
          gridResolution,
          gridResolution,
          state.variables,
        );
        traces.push({
          x: grid.x,
          y: grid.y,
          z: grid.z,
          type: 'surface',
          name: eq.expression,
          colorscale: [
            [0, eq.color],
            [1, eq.color],
          ],
          showscale: false,
        });
      } catch {
        // Skip invalid expressions
      }
    }

    return traces;
  }, [equations, xRange, yRange, gridResolution, state.variables]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      autosize: true,
      margin: { l: 0, r: 0, t: 0, b: 0 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      scene: {
        xaxis: {
          title: 'x',
          gridcolor: state.darkMode ? '#334155' : '#e2e8f0',
          color: state.darkMode ? '#94a3b8' : '#64748b',
        },
        yaxis: {
          title: 'y',
          gridcolor: state.darkMode ? '#334155' : '#e2e8f0',
          color: state.darkMode ? '#94a3b8' : '#64748b',
        },
        zaxis: {
          title: 'z',
          gridcolor: state.darkMode ? '#334155' : '#e2e8f0',
          color: state.darkMode ? '#94a3b8' : '#64748b',
        },
        bgcolor: 'transparent',
      },
      showlegend: data.length > 1,
      legend: {
        x: 0,
        y: 1,
        bgcolor: 'transparent',
        font: { color: state.darkMode ? '#e2e8f0' : '#1e293b', size: 11 },
      },
    }),
    [data.length, state.darkMode],
  );

  return (
    <div className="relative h-full w-full">
      <PlotlyWrapper data={data} layout={layout} style={{ width: '100%', height: '100%' }} />
      {data.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-lg bg-[var(--color-surface)] px-4 py-2 text-[var(--color-text-secondary)] text-sm opacity-60">
            Add a surface equation to see the 3D plot
          </span>
        </div>
      )}
    </div>
  );
}
