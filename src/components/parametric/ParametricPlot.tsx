import type { Data, Layout } from 'plotly.js-dist-min';
import { useMemo } from 'react';

import { useAppContext } from '../../context/AppContext';
import { evaluateParametric2D, evaluateParametric3D, evaluatePolar } from '../../lib/expressionParser';
import PlotlyWrapper from '../../lib/PlotlyWrapper';

export default function ParametricPlot() {
  const { state } = useAppContext();

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
      autosize: true,
      margin: { l: 50, r: 20, t: 20, b: 40 },
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
      ...(isPolar
        ? {
            polar: {
              bgcolor: 'transparent',
              radialaxis: {
                color: state.darkMode ? '#94a3b8' : '#64748b',
                gridcolor: state.darkMode ? '#334155' : '#e2e8f0',
              },
              angularaxis: {
                color: state.darkMode ? '#94a3b8' : '#64748b',
                gridcolor: state.darkMode ? '#334155' : '#e2e8f0',
              },
            },
          }
        : is3D
          ? {
              scene: {
                xaxis: {
                  color: state.darkMode ? '#94a3b8' : '#64748b',
                  gridcolor: state.darkMode ? '#334155' : '#e2e8f0',
                },
                yaxis: {
                  color: state.darkMode ? '#94a3b8' : '#64748b',
                  gridcolor: state.darkMode ? '#334155' : '#e2e8f0',
                },
                zaxis: {
                  color: state.darkMode ? '#94a3b8' : '#64748b',
                  gridcolor: state.darkMode ? '#334155' : '#e2e8f0',
                },
              },
            }
          : {
              xaxis: {
                zeroline: true,
                zerolinecolor: '#94a3b8',
                gridcolor: state.darkMode ? '#334155' : '#e2e8f0',
                color: state.darkMode ? '#94a3b8' : '#64748b',
              },
              yaxis: {
                zeroline: true,
                zerolinecolor: '#94a3b8',
                gridcolor: state.darkMode ? '#334155' : '#e2e8f0',
                color: state.darkMode ? '#94a3b8' : '#64748b',
                scaleanchor: 'x',
              },
            }),
    }),
    [data.length, state.darkMode, is3D, isPolar],
  );

  return (
    <div className="relative h-full w-full">
      <PlotlyWrapper data={data} layout={layout} style={{ width: '100%', height: '100%' }} />
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
