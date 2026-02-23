import { useAppContext } from '../../context/AppContext';
import CalculusPlot from './CalculusPlot';
import DerivativeInput from './DerivativeInput';
import IntegralInput from './IntegralInput';
import LimitInput from './LimitInput';

export default function CalculusPanel() {
  const { state, dispatch } = useAppContext();
  const c = state.calculus;
  const hasData = !!(
    c.derivativeExpr ||
    c.derivativeResult ||
    c.integralExpr ||
    c.integralResult ||
    c.limitExpr ||
    c.limitResult
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <section
        aria-label="Calculus inputs"
        className="flex max-h-[40vh] w-full flex-col gap-4 overflow-y-auto border-[var(--color-border)] border-b p-4 md:max-h-none md:w-80 md:border-r md:border-b-0"
      >
        {hasData && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'CLEAR_CALCULUS' })}
            className="self-end rounded px-2 py-0.5 text-[var(--color-text-secondary)] text-xs transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-error)]"
          >
            Clear All
          </button>
        )}
        <DerivativeInput />
        <IntegralInput />
        <LimitInput />
      </section>
      <div role="img" aria-label="Calculus plot" className="min-h-[300px] flex-1">
        <CalculusPlot />
      </div>
    </div>
  );
}
