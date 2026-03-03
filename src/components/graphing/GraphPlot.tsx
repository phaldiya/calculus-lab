import type { Data, Layout, PlotMouseEvent } from 'plotly.js-dist-min';
import { useCallback, useMemo, useState } from 'react';

import { useAppContext } from '../../context/AppContext';
import {
  evaluateOverGrid,
  evaluateOverRange,
  parseImplicitEquation,
  parseInequalityExpression,
} from '../../lib/expressionParser';
import PlotlyWrapper from '../../lib/PlotlyWrapper';
import { make2DBaseLayout, make2DXAxis, make2DYAxis, useCenteredAxes } from '../../lib/plotTheme';
import CoordinateDisplay from './CoordinateDisplay';

export default function GraphPlot() {
  const { state } = useAppContext();
  const [coordinates, setCoordinates] = useState<{ x: number; y: number } | null>(null);
  const { xRange, yRange, xAxisPos, yAxisPos, onRelayout } = useCenteredAxes();

  const data = useMemo(() => {
    const traces: Data[] = [];

    // Equation traces
    for (const eq of state.equations) {
      if (!eq.visible) continue;
      try {
        if (eq.mode === 'inequality') {
          const parsed = parseInequalityExpression(eq.expression);
          if (!parsed) continue;
          const grid = evaluateOverGrid(parsed.rearranged, -10, 10, -10, 10, 200, 200, state.variables);
          traces.push({
            x: grid.x,
            y: grid.y,
            z: grid.z,
            type: 'contour',
            name: eq.expression,
            showlegend: true,
            contours: { type: 'constraint', operation: parsed.operator, value: 0 },
            colorscale: [
              [0, eq.color],
              [1, eq.color],
            ],
            opacity: 0.3,
            line: { color: eq.color, width: 2 },
            showscale: false,
            hoverinfo: 'x+y',
          });
        } else if (eq.mode === 'implicit') {
          const rearranged = parseImplicitEquation(eq.expression);
          if (!rearranged) continue;
          const grid = evaluateOverGrid(rearranged, -10, 10, -10, 10, 200, 200, state.variables);
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
          const result = evaluateOverRange(eq.expression, -10, 10, 500, state.variables);
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

    // Point data traces
    for (const pd of state.pointDataSets) {
      if (!pd.visible) continue;
      traces.push({
        x: pd.points.map((p) => p.x),
        y: pd.points.map((p) => p.y),
        type: 'scatter',
        mode: pd.mode,
        name: pd.label,
        marker: { color: pd.color, size: 8 },
        line: { color: pd.color, width: 2 },
        hoverinfo: 'x+y',
      });
    }

    return traces;
  }, [state.equations, state.pointDataSets, state.variables]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      ...make2DBaseLayout(state.darkMode, {
        showlegend: data.length > 1,
        hovermode: 'closest',
      }),
      xaxis: make2DXAxis(state.darkMode, { range: xRange, position: xAxisPos }),
      yaxis: make2DYAxis(state.darkMode, { range: yRange, position: yAxisPos }),
    }),
    [data.length, state.darkMode, xRange, yRange, xAxisPos, yAxisPos],
  );

  const handleHover = useCallback((event: PlotMouseEvent) => {
    if (event.points.length > 0) {
      setCoordinates({ x: event.points[0].x, y: event.points[0].y });
    }
  }, []);

  const handleUnhover = useCallback(() => {
    setCoordinates(null);
  }, []);

  return (
    <div className="relative h-full w-full">
      <CoordinateDisplay coordinates={coordinates} />
      <PlotlyWrapper
        data={data}
        layout={layout}
        style={{ width: '100%', height: '100%' }}
        onHover={handleHover}
        onUnhover={handleUnhover}
        onRelayout={onRelayout}
      />
      {data.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-lg bg-[var(--color-surface)] px-4 py-2 text-[var(--color-text-secondary)] text-sm opacity-60">
            Add an equation to see the graph
          </span>
        </div>
      )}
    </div>
  );
}
