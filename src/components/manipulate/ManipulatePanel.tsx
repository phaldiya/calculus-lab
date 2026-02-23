import { useAppContext } from '../../context/AppContext';
import ManipulateEquationInput from './ManipulateEquationInput';
import ManipulateEquationList from './ManipulateEquationList';
import ManipulatePlot from './ManipulatePlot';
import ManipulateRangeControls from './ManipulateRangeControls';
import SliderBar from './SliderBar';
import SliderPanel from './SliderPanel';

export default function ManipulatePanel() {
  const { state, dispatch } = useAppContext();
  const hasData = state.manipulate.equations.length > 0 || state.manipulate.sliders.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <section
          aria-label="Interactive plot controls"
          className="flex max-h-[40vh] w-full flex-col gap-4 overflow-y-auto border-[var(--color-border)] border-b p-4 md:max-h-none md:w-72 md:border-r md:border-b-0"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--color-text)] text-sm">Interact</h2>
            {hasData && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'CLEAR_MANIPULATE' })}
                className="rounded px-2 py-0.5 text-[var(--color-text-secondary)] text-xs transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-error)]"
              >
                Clear All
              </button>
            )}
          </div>
          <div>
            <ManipulateEquationInput />
          </div>
          <ManipulateEquationList />
          <div className="border-[var(--color-border)] border-t pt-3">
            <SliderPanel />
          </div>
          <div className="border-[var(--color-border)] border-t pt-3">
            <ManipulateRangeControls />
          </div>
        </section>
        <div role="img" aria-label="Interactive manipulate plot" className="min-h-[300px] flex-1">
          <ManipulatePlot />
        </div>
      </div>
      <SliderBar />
    </div>
  );
}
