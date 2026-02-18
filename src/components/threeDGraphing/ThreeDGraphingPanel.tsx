import { useAppContext } from '../../context/AppContext';
import ThreeDEquationInput from './ThreeDEquationInput';
import ThreeDEquationList from './ThreeDEquationList';
import ThreeDPlot from './ThreeDPlot';
import ThreeDRangeControls from './ThreeDRangeControls';

export default function ThreeDGraphingPanel() {
  const { state, dispatch } = useAppContext();
  const hasData = state.threeDGraphing.equations.length > 0;

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div
        role="region"
        aria-label="3D surface controls"
        className="flex max-h-[40vh] w-full flex-col gap-4 overflow-y-auto border-[var(--color-border)] border-b p-4 md:max-h-none md:w-72 md:border-r md:border-b-0"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[var(--color-text)] text-sm">3D Surfaces</h2>
          {hasData && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'CLEAR_3D_GRAPHING' })}
              className="rounded px-2 py-0.5 text-[var(--color-text-secondary)] text-xs transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-error)]"
            >
              Clear All
            </button>
          )}
        </div>
        <div>
          <ThreeDEquationInput />
        </div>
        <ThreeDEquationList />
        <div className="border-[var(--color-border)] border-t pt-3">
          <ThreeDRangeControls />
        </div>
      </div>
      <div role="img" aria-label="3D surface plot" className="min-h-[300px] flex-1">
        <ThreeDPlot />
      </div>
    </div>
  );
}
