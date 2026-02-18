import type { Data, Layout } from 'plotly.js-dist-min';
import { useMemo } from 'react';

import { useAppContext } from '../../context/AppContext';
import PlotlyWrapper from '../../lib/PlotlyWrapper';

export default function StatisticsPlot() {
  const { state } = useAppContext();
  const { data, xyData, regressionResult } = state.statistics;

  const plotData = useMemo(() => {
    const traces: Data[] = [];

    // Histogram of single-value data
    if (data.length > 0) {
      traces.push({
        x: data,
        type: 'histogram',
        name: 'Distribution',
        marker: { color: 'rgba(99, 102, 241, 0.6)' },
      });
    }

    // Scatter of XY data
    if (xyData.length > 0) {
      traces.push({
        x: xyData.map((p) => p.x),
        y: xyData.map((p) => p.y),
        type: 'scatter',
        mode: 'markers',
        name: 'Data Points',
        marker: { color: '#6366f1', size: 8 },
      });
    }

    // Regression line/curve
    if (regressionResult) {
      traces.push({
        x: regressionResult.predictions.map((p) => p.x),
        y: regressionResult.predictions.map((p) => p.y),
        type: 'scatter',
        mode: 'lines',
        name: regressionResult.equation,
        line: { color: '#ef4444', width: 2 },
      });
    }

    return traces;
  }, [data, xyData, regressionResult]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      autosize: true,
      margin: { l: 50, r: 20, t: 20, b: 40 },
      xaxis: {
        zeroline: true,
        zerolinecolor: '#94a3b8',
        showgrid: true,
        gridcolor: state.darkMode ? '#475569' : '#e2e8f0',
        color: state.darkMode ? '#94a3b8' : '#64748b',
      },
      yaxis: {
        zeroline: true,
        zerolinecolor: '#94a3b8',
        showgrid: true,
        gridcolor: state.darkMode ? '#475569' : '#e2e8f0',
        color: state.darkMode ? '#94a3b8' : '#64748b',
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      showlegend: true,
      legend: {
        x: 0,
        y: 1,
        bgcolor: 'transparent',
        font: { color: state.darkMode ? '#e2e8f0' : '#1e293b', size: 11 },
      },
      barmode: 'overlay',
    }),
    [state.darkMode],
  );

  if (plotData.length === 0) {
    // Invisible anchor trace to force Plotly to render axes with visible gridlines
    const emptyTrace: Data[] = [
      {
        x: [0, 10],
        y: [0, 10],
        type: 'scatter',
        mode: 'markers',
        marker: { opacity: 0 },
        showlegend: false,
        hoverinfo: 'skip',
      },
    ];
    return (
      <div className="relative h-full w-full">
        <PlotlyWrapper data={emptyTrace} layout={layout} style={{ width: '100%', height: '100%' }} />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-lg bg-[var(--color-surface)] px-4 py-2 text-[var(--color-text-secondary)] text-sm opacity-60">
            Enter data to see visualization
          </span>
        </div>
      </div>
    );
  }

  return <PlotlyWrapper data={plotData} layout={layout} style={{ width: '100%', height: '100%' }} />;
}
