import type { Data, Layout } from 'plotly.js-dist-min';
import { useMemo } from 'react';

import { evaluateOverGrid, evaluateParametric3D } from '../../lib/expressionParser';
import PlotlyWrapper from '../../lib/PlotlyWrapper';
import { make3DAxis } from '../../lib/plotTheme';
import type { GraphState, UnifiedEquation, Variable } from '../../types';

interface Props {
  equations: UnifiedEquation[];
  variables: Variable[];
  sliders: GraphState['sliders'];
  xRange: [number, number];
  yRange: [number, number];
  gridResolution: number;
  darkMode: boolean;
}

export default function Graph3DPlot({
  equations,
  variables,
  sliders,
  xRange,
  yRange,
  gridResolution,
  darkMode,
}: Props) {
  const mergedVariables = useMemo<Variable[]>(() => {
    const varMap = new Map<string, number>();
    for (const v of variables) varMap.set(v.name, v.value);
    for (const s of sliders) varMap.set(s.name, s.value);
    return Array.from(varMap.entries()).map(([name, value]) => ({ name, value }));
  }, [variables, sliders]);

  const data = useMemo(() => {
    const traces: Data[] = [];

    for (const eq of equations) {
      if (!eq.visible) continue;
      try {
        if (eq.type === 'surface-3d') {
          const grid = evaluateOverGrid(
            eq.components[0],
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
            type: 'surface',
            name: eq.rawInput,
            colorscale: [
              [0, eq.color],
              [1, eq.color],
            ],
            showscale: false,
          });
        } else if (eq.type === 'parametric-3d') {
          const range = eq.paramRange ?? { min: 0, max: 2 * Math.PI, numPoints: 500 };
          const result = evaluateParametric3D(
            eq.components[0],
            eq.components[1],
            eq.components[2],
            range.min,
            range.max,
            range.numPoints,
            mergedVariables,
          );
          traces.push({
            x: result.x,
            y: result.y,
            z: result.z,
            type: 'scatter3d',
            mode: 'lines',
            name: `(${eq.components.join(', ')})`,
            line: { color: eq.color, width: 3 },
          });
        }
      } catch {
        // Skip invalid expressions
      }
    }

    return traces;
  }, [equations, mergedVariables, xRange, yRange, gridResolution]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      autosize: true,
      margin: { l: 0, r: 0, t: 0, b: 0 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      scene: {
        xaxis: { ...make3DAxis(darkMode), title: 'x' },
        yaxis: { ...make3DAxis(darkMode), title: 'y' },
        zaxis: { ...make3DAxis(darkMode), title: 'z' },
        bgcolor: 'transparent',
      },
      showlegend: data.length > 1,
      legend: {
        x: 0,
        y: 1,
        bgcolor: 'transparent',
        font: { color: darkMode ? '#e2e8f0' : '#1e293b', size: 11 },
      },
    }),
    [data.length, darkMode],
  );

  return (
    <div className="relative h-full w-full">
      <PlotlyWrapper data={data} layout={layout} style={{ width: '100%', height: '100%' }} />
      {data.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-lg bg-[var(--color-surface)] px-4 py-2 text-[var(--color-text-secondary)] text-sm opacity-60">
            Add a 3D equation to see the surface
          </span>
        </div>
      )}
    </div>
  );
}
