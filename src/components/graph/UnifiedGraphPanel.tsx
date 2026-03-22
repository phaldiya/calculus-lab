import { useAppContext } from '../../context/AppContext';
import PointPlotInput from './PointPlotInput';
import RangeControls from './RangeControls';
import SliderBar from './SliderBar';
import SliderPanel from './SliderPanel';
import UnifiedEquationInput from './UnifiedEquationInput';
import UnifiedEquationList from './UnifiedEquationList';
import UnifiedGraphPlot from './UnifiedGraphPlot';

export default function UnifiedGraphPanel() {
  const { state, dispatch } = useAppContext();
  const hasData =
    state.graph.equations.length > 0 || state.graph.pointDataSets.length > 0 || state.graph.sliders.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col md:flex-row">
        <section
          aria-label="Graph controls"
          className="flex max-h-[40vh] w-full flex-col gap-4 overflow-y-auto border-[var(--color-border)] border-b p-4 md:max-h-none md:w-72 md:border-r md:border-b-0"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--color-text)] text-sm">Graph</h2>
            {hasData && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'GRAPH_CLEAR' })}
                className="rounded px-2 py-0.5 text-[var(--color-text-secondary)] text-xs transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-error)]"
              >
                Clear All
              </button>
            )}
          </div>
          <UnifiedEquationInput />
          <UnifiedEquationList />
          {state.graph.sliders.length > 0 && (
            <div className="border-[var(--color-border)] border-t pt-3">
              <SliderPanel />
            </div>
          )}
          <div className="border-[var(--color-border)] border-t pt-3">
            <PointPlotInput />
          </div>
          <div className="border-[var(--color-border)] border-t pt-3">
            <RangeControls />
          </div>
        </section>
        <div role="img" aria-label="Function graph" className="min-h-[300px] flex-1">
          <UnifiedGraphPlot />
        </div>
      </div>
      <SliderBar />
    </div>
  );
}
