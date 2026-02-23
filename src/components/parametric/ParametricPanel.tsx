import { useAppContext } from '../../context/AppContext';
import ParametricEquationInput from './ParametricEquationInput';
import ParametricEquationList from './ParametricEquationList';
import ParametricPlot from './ParametricPlot';
import PlotTypeSelector from './PlotTypeSelector';

export default function ParametricPanel() {
  const { state, dispatch } = useAppContext();
  const hasData = state.parametric.equations.length > 0;

  return (
    <div className="flex h-full flex-col md:flex-row">
      <section
        aria-label="Parametric curve controls"
        className="flex max-h-[40vh] w-full flex-col gap-4 overflow-y-auto border-[var(--color-border)] border-b p-4 md:max-h-none md:w-72 md:border-r md:border-b-0"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[var(--color-text)] text-sm">Parametric & Polar</h2>
          {hasData && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'CLEAR_PARAMETRIC' })}
              className="rounded px-2 py-0.5 text-[var(--color-text-secondary)] text-xs transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-error)]"
            >
              Clear All
            </button>
          )}
        </div>
        <PlotTypeSelector />
        <div>
          <ParametricEquationInput />
        </div>
        <ParametricEquationList />
      </section>
      <div role="img" aria-label="Parametric plot" className="min-h-[300px] flex-1">
        <ParametricPlot />
      </div>
    </div>
  );
}
