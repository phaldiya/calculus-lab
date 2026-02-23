import { useAppContext } from '../../context/AppContext';
import EquationInput from './EquationInput';
import EquationList from './EquationList';
import GraphPlot from './GraphPlot';
import PointPlotInput from './PointPlotInput';

export default function GraphPanel() {
  const { state, dispatch } = useAppContext();
  const hasData = state.equations.length > 0 || state.pointDataSets.length > 0;

  return (
    <div className="flex h-full flex-col md:flex-row">
      <section
        aria-label="Equation controls"
        className="flex max-h-[40vh] w-full flex-col gap-4 overflow-y-auto border-[var(--color-border)] border-b p-4 md:max-h-none md:w-72 md:border-r md:border-b-0"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[var(--color-text)] text-sm">Equations</h2>
          {hasData && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'CLEAR_EQUATIONS' })}
              className="rounded px-2 py-0.5 text-[var(--color-text-secondary)] text-xs transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-error)]"
            >
              Clear All
            </button>
          )}
        </div>
        <div>
          <EquationInput />
        </div>
        <EquationList />
        <div className="border-[var(--color-border)] border-t pt-3">
          <PointPlotInput />
        </div>
      </section>
      <div role="img" aria-label="Function graph" className="min-h-[300px] flex-1">
        <GraphPlot />
      </div>
    </div>
  );
}
