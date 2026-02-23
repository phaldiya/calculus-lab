import { useAppContext } from '../../context/AppContext';
import { linearRegression, polynomialRegression } from '../../lib/statisticsEngine';

export default function RegressionPanel() {
  const { state, dispatch } = useAppContext();
  const { xyData, regressionType, regressionDegree, regressionResult } = state.statistics;

  const handleCompute = () => {
    if (xyData.length < 2) return;
    try {
      const result =
        regressionType === 'linear' ? linearRegression(xyData) : polynomialRegression(xyData, regressionDegree);
      dispatch({ type: 'SET_STATISTICS', updates: { regressionResult: result } });
      dispatch({
        type: 'ADD_HISTORY',
        entry: {
          id: crypto.randomUUID(),
          tab: 'statistics',
          expression: `${regressionType} regression (${xyData.length} points)`,
          result: `${result.equation} (R²=${result.rSquared.toFixed(4)})`,
          timestamp: Date.now(),
        },
      });
    } catch (e) {
      console.error('Regression error:', e);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold text-[var(--color-text)] text-sm">Regression</h3>
      <div className="flex items-center gap-2">
        <select
          value={regressionType}
          onChange={(e) =>
            dispatch({
              type: 'SET_STATISTICS',
              updates: { regressionType: e.target.value as 'linear' | 'polynomial' },
            })
          }
          aria-label="Regression type"
          className="rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2 py-1 text-[var(--color-text)] text-sm"
        >
          <option value="linear">Linear</option>
          <option value="polynomial">Polynomial</option>
        </select>
        {regressionType === 'polynomial' && (
          <select
            value={regressionDegree}
            onChange={(e) =>
              dispatch({
                type: 'SET_STATISTICS',
                updates: { regressionDegree: parseInt(e.target.value, 10) },
              })
            }
            aria-label="Polynomial degree"
            className="rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2 py-1 text-[var(--color-text)] text-sm"
          >
            <option value={2}>Degree 2</option>
            <option value={3}>Degree 3</option>
            <option value={4}>Degree 4</option>
          </select>
        )}
        <button
          type="button"
          onClick={handleCompute}
          disabled={xyData.length < 2}
          className="rounded bg-[var(--color-primary)] px-3 py-1 font-medium text-sm text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
        >
          Fit
        </button>
      </div>
      {xyData.length < 2 && (
        <p className="text-[var(--color-text-secondary)] text-xs">Enter X,Y pairs above to enable regression</p>
      )}
      {regressionResult && (
        <output aria-live="polite" className="flex flex-col gap-1 rounded-lg bg-[var(--color-surface-alt)] p-3">
          <p className="font-mono text-[var(--color-text)] text-sm">{regressionResult.equation}</p>
          <p className="text-[var(--color-text-secondary)] text-xs">R² = {regressionResult.rSquared.toFixed(6)}</p>
        </output>
      )}
    </div>
  );
}
