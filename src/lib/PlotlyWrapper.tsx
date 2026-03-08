import type { Config, Data, Layout, PlotMouseEvent } from 'plotly.js-dist-min';

type PlotRelayoutEvent = Record<string, unknown>;

import { lazy, Suspense } from 'react';

const Plot = lazy(() => import('react-plotly.js'));

interface PlotlyWrapperProps {
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  className?: string;
  style?: React.CSSProperties;
  onHover?: (event: PlotMouseEvent) => void;
  onUnhover?: (event: PlotMouseEvent) => void;
  onRelayout?: (event: PlotRelayoutEvent) => void;
}

export default function PlotlyWrapper({
  data,
  layout,
  config,
  className,
  style,
  onHover,
  onUnhover,
  onRelayout,
}: PlotlyWrapperProps) {
  const defaultConfig: Partial<Config> = {
    responsive: true,
    displayModeBar: 'hover',
    scrollZoom: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    ...config,
  };

  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-[var(--color-text-secondary)]">
          Loading graph...
        </div>
      }
    >
      <Plot
        data={data}
        layout={layout}
        config={defaultConfig}
        className={className}
        style={style}
        useResizeHandler
        onHover={onHover}
        onUnhover={onUnhover}
        onRelayout={onRelayout}
      />
    </Suspense>
  );
}
