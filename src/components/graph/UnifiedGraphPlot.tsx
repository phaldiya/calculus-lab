import { useCallback, useMemo } from 'react';

import { useAppContext } from '../../context/AppContext';
import { is2DType, is3DType } from '../../lib/expressionClassifier';
import Graph2DPlot from './Graph2DPlot';
import Graph3DPlot from './Graph3DPlot';

export default function UnifiedGraphPlot() {
  const { state, dispatch } = useAppContext();
  const { equations, pointDataSets, sliders, xRange, yRange, gridResolution } = state.graph;

  const equations2D = useMemo(() => equations.filter((eq) => is2DType(eq.type)), [equations]);
  const equations3D = useMemo(() => equations.filter((eq) => is3DType(eq.type)), [equations]);

  const has2D = equations2D.some((eq) => eq.visible) || pointDataSets.some((pd) => pd.visible);
  const has3D = equations3D.some((eq) => eq.visible);
  const hasBoth = has2D && has3D;

  const handleRangeChange = useCallback(
    (newX: [number, number], newY: [number, number]) => {
      dispatch({ type: 'GRAPH_SET_CONFIG', updates: { xRange: newX, yRange: newY } });
    },
    [dispatch],
  );

  const plot2D = (eqs: typeof equations2D, pds: typeof pointDataSets) => (
    <Graph2DPlot
      equations={eqs}
      pointDataSets={pds}
      variables={state.variables}
      sliders={sliders}
      xRange={xRange}
      yRange={yRange}
      gridResolution={gridResolution}
      darkMode={state.darkMode}
      onRangeChange={handleRangeChange}
    />
  );

  if (!has2D && !has3D) {
    return plot2D([], []);
  }

  if (hasBoth) {
    return (
      <div className="grid h-full w-full grid-rows-2 gap-1">
        {plot2D(equations2D, pointDataSets)}
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

  return plot2D(equations2D, pointDataSets);
}
