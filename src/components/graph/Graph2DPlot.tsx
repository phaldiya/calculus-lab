import type { Data, Layout, PlotMouseEvent } from 'plotly.js-dist-min';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  evaluateOverGrid,
  evaluateOverRange,
  evaluateParametric2D,
  evaluatePolar,
  parseImplicitEquation,
  parseInequalityExpression,
} from '../../lib/expressionParser';
import PlotlyWrapper from '../../lib/PlotlyWrapper';
import { make2DBaseLayout, make2DXAxis, make2DYAxis, makePolarAxis, useCenteredAxes } from '../../lib/plotTheme';
import type { GraphState, PointData, UnifiedEquation, Variable } from '../../types';
import CoordinateDisplay from './CoordinateDisplay';

interface Props {
  equations: UnifiedEquation[];
  pointDataSets: PointData[];
  variables: Variable[];
  sliders: GraphState['sliders'];
  xRange: [number, number];
  yRange: [number, number];
  gridResolution: number;
  darkMode: boolean;
  onRangeChange?: (xRange: [number, number], yRange: [number, number]) => void;
}

export default function Graph2DPlot({
  equations,
  pointDataSets,
  variables,
  sliders,
  xRange,
  yRange,
  gridResolution,
  darkMode,
  onRangeChange,
}: Props) {
  const [coordinates, setCoordinates] = useState<{ x: number; y: number } | null>(null);
  const { xRange: liveXRange, yRange: liveYRange, xAxisPos, yAxisPos, onRelayout } = useCenteredAxes(xRange, yRange);

  // Notify parent of live range changes (for syncing sidebar controls)
  const prevLiveRef = useRef({ x: liveXRange, y: liveYRange });
  useEffect(() => {
    if (prevLiveRef.current.x !== liveXRange || prevLiveRef.current.y !== liveYRange) {
      prevLiveRef.current = { x: liveXRange, y: liveYRange };
      onRangeChange?.(liveXRange, liveYRange);
    }
  }, [liveXRange, liveYRange, onRangeChange]);

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
        switch (eq.type) {
          case 'inequality-2d': {
            const parsed = parseInequalityExpression(eq.components[0]);
            if (!parsed) continue;
            const grid = evaluateOverGrid(
              parsed.rearranged,
              xRange[0],
              xRange[1],
              yRange[0],
              yRange[1],
              gridResolution * 4,
              gridResolution * 4,
              mergedVariables,
            );
            traces.push({
              x: grid.x,
              y: grid.y,
              z: grid.z,
              type: 'contour',
              name: eq.rawInput,
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
            break;
          }
          case 'implicit-2d': {
            const rearranged = parseImplicitEquation(eq.components[0]);
            if (!rearranged) continue;
            const grid = evaluateOverGrid(
              rearranged,
              xRange[0],
              xRange[1],
              yRange[0],
              yRange[1],
              gridResolution * 4,
              gridResolution * 4,
              mergedVariables,
            );
            traces.push({
              x: grid.x,
              y: grid.y,
              z: grid.z,
              type: 'contour',
              name: eq.rawInput,
              showlegend: true,
              contours: { type: 'constraint', operation: '=', value: 0 },
              line: { color: eq.color, width: 2 },
              showscale: false,
              hoverinfo: 'x+y',
            });
            break;
          }
          case 'polar': {
            const range = eq.paramRange ?? { min: 0, max: 2 * Math.PI, numPoints: 500 };
            const result = evaluatePolar(eq.components[0], range.min, range.max, range.numPoints, mergedVariables);
            // Convert polar to Cartesian for co-plotting with standard 2D
            traces.push({
              x: result.x,
              y: result.y,
              type: 'scatter',
              mode: 'lines',
              name: `r = ${eq.components[0]}`,
              line: { color: eq.color, width: 2 },
              hoverinfo: 'x+y',
            });
            break;
          }
          case 'parametric-2d': {
            const range = eq.paramRange ?? { min: 0, max: 2 * Math.PI, numPoints: 500 };
            const result = evaluateParametric2D(
              eq.components[0],
              eq.components[1],
              range.min,
              range.max,
              range.numPoints,
              mergedVariables,
            );
            traces.push({
              x: result.x,
              y: result.y,
              type: 'scatter',
              mode: 'lines',
              name: `(${eq.components[0]}, ${eq.components[1]})`,
              line: { color: eq.color, width: 2 },
              hoverinfo: 'x+y',
            });
            break;
          }
          default: {
            // standard-2d
            const result = evaluateOverRange(eq.components[0], xRange[0], xRange[1], 500, mergedVariables);
            traces.push({
              x: result.x,
              y: result.y,
              type: 'scatter',
              mode: 'lines',
              name: eq.rawInput,
              line: { color: eq.color, width: 2 },
              hoverinfo: 'x+y',
            });
          }
        }
      } catch {
        // Skip invalid equations
      }
    }

    for (const pd of pointDataSets) {
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
  }, [equations, pointDataSets, mergedVariables, xRange, yRange]);

  // Check if all visible equations are polar (use polar layout)
  const allPolar =
    equations.filter((eq) => eq.visible).every((eq) => eq.type === 'polar') &&
    equations.some((eq) => eq.visible && eq.type === 'polar');

  const layout = useMemo<Partial<Layout>>(
    () => ({
      ...make2DBaseLayout(darkMode, { showlegend: data.length > 1, hovermode: 'closest' }),
      ...(allPolar
        ? { polar: makePolarAxis(darkMode) }
        : {
            xaxis: make2DXAxis(darkMode, { range: liveXRange, position: xAxisPos }),
            yaxis: make2DYAxis(darkMode, { range: liveYRange, position: yAxisPos }),
          }),
    }),
    [data.length, darkMode, allPolar, liveXRange, liveYRange, xAxisPos, yAxisPos],
  );

  const handleHover = useCallback((event: PlotMouseEvent) => {
    if (event.points.length > 0) {
      setCoordinates({ x: event.points[0].x, y: event.points[0].y });
    }
  }, []);

  const handleUnhover = useCallback(() => setCoordinates(null), []);

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
