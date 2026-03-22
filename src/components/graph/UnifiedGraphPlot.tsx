import { useMemo } from 'react';

import { useAppContext } from '../../context/AppContext';
import { is2DType, is3DType } from '../../lib/expressionClassifier';
import Graph2DPlot from './Graph2DPlot';
import Graph3DPlot from './Graph3DPlot';

export default function UnifiedGraphPlot() {
  const { state } = useAppContext();
  const { equations, pointDataSets, sliders, xRange, yRange, gridResolution } = state.graph;

  const equations2D = useMemo(() => equations.filter((eq) => is2DType(eq.type)), [equations]);
  const equations3D = useMemo(() => equations.filter((eq) => is3DType(eq.type)), [equations]);

  const has2D = equations2D.some((eq) => eq.visible) || pointDataSets.some((pd) => pd.visible);
  const has3D = equations3D.some((eq) => eq.visible);
  const hasBoth = has2D && has3D;

  if (!has2D && !has3D) {
    return (
      <Graph2DPlot
        equations={[]}
        pointDataSets={[]}
        variables={state.variables}
        sliders={sliders}
        xRange={xRange}
        yRange={yRange}
        darkMode={state.darkMode}
      />
    );
  }

  if (hasBoth) {
    return (
      <div className="grid h-full w-full grid-rows-2 gap-1">
        <Graph2DPlot
          equations={equations2D}
          pointDataSets={pointDataSets}
          variables={state.variables}
          sliders={sliders}
          xRange={xRange}
          yRange={yRange}
          darkMode={state.darkMode}
        />
        <Graph3DPlot
          equations={equations3D}
          variables={state.variables}
          sliders={sliders}
          xRange={xRange}
          yRange={yRange}
          gridResolution={gridResolution}
          darkMode={state.darkMode}
        />
      </div>
    );
  }

  if (has3D) {
    return (
      <Graph3DPlot
        equations={equations3D}
        variables={state.variables}
        sliders={sliders}
        xRange={xRange}
        yRange={yRange}
        gridResolution={gridResolution}
        darkMode={state.darkMode}
      />
    );
  }

  return (
    <Graph2DPlot
      equations={equations2D}
      pointDataSets={pointDataSets}
      variables={state.variables}
      sliders={sliders}
      xRange={xRange}
      yRange={yRange}
      darkMode={state.darkMode}
    />
  );
}
