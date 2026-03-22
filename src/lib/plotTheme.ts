import type { Layout } from 'plotly.js-dist-min';

type PlotRelayoutEvent = Record<string, unknown>;

import { useCallback, useState } from 'react';

type AxisConfig = Record<string, unknown>;

const light = {
  zeroline: '#64748b',
  majorGrid: '#cbd5e1',
  minorGrid: '#e2e8f0',
  axisText: '#64748b',
  legendText: '#1e293b',
  plotBg: '#fafbfc',
};

const dark = {
  zeroline: '#94a3b8',
  majorGrid: '#334155',
  minorGrid: '#1e293b',
  axisText: '#94a3b8',
  legendText: '#e2e8f0',
  plotBg: '#0d1321',
};

function colors(darkMode: boolean) {
  return darkMode ? dark : light;
}

export function make2DXAxis(darkMode: boolean, extra?: AxisConfig): AxisConfig {
  const c = colors(darkMode);
  return {
    zeroline: true,
    zerolinecolor: c.zeroline,
    zerolinewidth: 2,
    showgrid: true,
    gridcolor: c.majorGrid,
    gridwidth: 1,
    color: c.axisText,
    range: [-10, 10],
    tick0: 0,
    dtick: 1,
    anchor: 'free',
    position: 0.5,
    tickfont: { size: 9 },
    minor: {
      showgrid: true,
      gridcolor: c.minorGrid,
      gridwidth: 1,
      dtick: 0.2,
    },
    ...extra,
  };
}

export function make2DYAxis(darkMode: boolean, extra?: AxisConfig): AxisConfig {
  return make2DXAxis(darkMode, { scaleanchor: 'x', scaleratio: 1, constrain: 'domain', ...extra });
}

export function make2DBaseLayout(darkMode: boolean, extra?: Partial<Layout>): Partial<Layout> {
  const c = colors(darkMode);
  return {
    autosize: true,
    margin: { l: 20, r: 20, t: 20, b: 20 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: c.plotBg,
    legend: {
      x: 0,
      y: 1,
      bgcolor: 'transparent',
      font: { color: c.legendText, size: 11 },
    },
    dragmode: 'pan',
    ...extra,
  };
}

export function makePolarAxis(darkMode: boolean): AxisConfig {
  const c = colors(darkMode);
  return {
    bgcolor: 'transparent',
    radialaxis: {
      color: c.axisText,
      gridcolor: c.majorGrid,
    },
    angularaxis: {
      color: c.axisText,
      gridcolor: c.majorGrid,
    },
  };
}

export function make3DAxis(darkMode: boolean): AxisConfig {
  const c = colors(darkMode);
  return {
    color: c.axisText,
    gridcolor: c.majorGrid,
  };
}

/** Compute normalized [0,1] position of zero within a range. */
function zeroPosition(min: number, max: number): number {
  if (max <= min) return 0.5;
  return Math.max(0, Math.min(1, -min / (max - min)));
}

const DEFAULT_RANGE: [number, number] = [-10, 10];

/**
 * Hook that keeps axis positions anchored to data-zero when the user
 * pans / pinch-zooms via Plotly's relayout events.
 * Also tracks live ranges so React re-renders don't reset the user's zoom.
 */
export function useCenteredAxes(initRange: [number, number] = DEFAULT_RANGE) {
  const [axes, setAxes] = useState({
    xRange: initRange,
    yRange: initRange,
    xAxisPos: 0.5,
    yAxisPos: 0.5,
  });

  const onRelayout = useCallback(
    (e: PlotRelayoutEvent) => {
      const xMin = e['xaxis.range[0]'] as number | undefined;
      const xMax = e['xaxis.range[1]'] as number | undefined;
      const yMin = e['yaxis.range[0]'] as number | undefined;
      const yMax = e['yaxis.range[1]'] as number | undefined;
      const autoX = e['xaxis.autorange'] as boolean | undefined;
      const autoY = e['yaxis.autorange'] as boolean | undefined;

      if (xMin == null && xMax == null && yMin == null && yMax == null && !autoX && !autoY) return;

      setAxes((prev) => {
        const xR: [number, number] = autoX ? initRange : xMin != null && xMax != null ? [xMin, xMax] : prev.xRange;
        const yR: [number, number] = autoY ? initRange : yMin != null && yMax != null ? [yMin, yMax] : prev.yRange;
        return {
          xRange: xR,
          yRange: yR,
          xAxisPos: zeroPosition(yR[0], yR[1]),
          yAxisPos: zeroPosition(xR[0], xR[1]),
        };
      });
    },
    [initRange],
  );

  return { ...axes, onRelayout };
}
