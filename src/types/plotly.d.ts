declare module 'react-plotly.js' {
  import { Component } from 'react';
  import { Data, Layout, Config, PlotMouseEvent } from 'plotly.js-dist-min';

  interface PlotParams {
    data: Data[];
    layout?: Partial<Layout>;
    config?: Partial<Config>;
    style?: React.CSSProperties;
    className?: string;
    useResizeHandler?: boolean;
    onHover?: (event: PlotMouseEvent) => void;
    onUnhover?: (event: PlotMouseEvent) => void;
    onClick?: (event: PlotMouseEvent) => void;
    onRelayout?: (event: Record<string, unknown>) => void;
  }

  export default class Plot extends Component<PlotParams> {}
}

declare module 'plotly.js-dist-min' {
  export interface Data {
    x?: number[] | string[];
    y?: number[] | string[];
    z?: number[][] | number[];
    type?: string;
    mode?: string;
    name?: string;
    marker?: Record<string, unknown>;
    line?: Record<string, unknown>;
    fill?: string;
    fillcolor?: string;
    text?: string | string[];
    hoverinfo?: string;
    showlegend?: boolean;
    [key: string]: unknown;
  }

  export interface Layout {
    title?: string | { text: string };
    xaxis?: Record<string, unknown>;
    yaxis?: Record<string, unknown>;
    showlegend?: boolean;
    legend?: Record<string, unknown>;
    margin?: { l: number; r: number; t: number; b: number };
    paper_bgcolor?: string;
    plot_bgcolor?: string;
    font?: Record<string, unknown>;
    autosize?: boolean;
    dragmode?: string;
    hovermode?: string | boolean;
    scene?: Record<string, unknown>;
    [key: string]: unknown;
  }

  export interface Config {
    responsive?: boolean;
    displayModeBar?: boolean | 'hover';
    scrollZoom?: boolean;
    modeBarButtonsToRemove?: string[];
    displaylogo?: boolean;
    [key: string]: unknown;
  }

  export interface PlotMouseEvent {
    points: Array<{
      x: number;
      y: number;
      curveNumber: number;
      pointNumber: number;
      data: Data;
    }>;
    event: MouseEvent;
  }

  export function newPlot(
    root: HTMLElement | string,
    data: Data[],
    layout?: Partial<Layout>,
    config?: Partial<Config>,
  ): Promise<void>;
}
