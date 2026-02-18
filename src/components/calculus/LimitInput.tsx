import { parse } from 'mathjs';
import { useState } from 'react';

import { useAppContext } from '../../context/AppContext';
import { computeLimit } from '../../lib/calculusEngine';
import { generateLimitSteps } from '../../lib/calculusStepEngine';
import { limitTex, safeToTex } from '../../lib/texHelpers';
import KaTeXRenderer from '../shared/KaTeXRenderer';
import type { StepItem } from '../shared/StepViewer';
import StepViewer from '../shared/StepViewer';

export default function LimitInput() {
  const { state, dispatch } = useAppContext();
  const [error, setError] = useState('');
  const [steps, setSteps] = useState<StepItem[]>([]);
  const [showSteps, setShowSteps] = useState(false);

  const handleCompute = () => {
    const { limitExpr, limitPoint } = state.calculus;
    if (!limitExpr.trim() || !limitPoint.trim()) return;

    setError('');
    try {
      const point = parseFloat(limitPoint);
      if (!Number.isFinite(point)) {
        setError('Point must be a valid number');
        return;
      }
      const result = computeLimit(limitExpr, point);
      const resultStr = result.toFixed(6);
      dispatch({ type: 'SET_CALCULUS', updates: { limitResult: resultStr } });

      const generatedSteps = generateLimitSteps(limitExpr, limitPoint, resultStr);
      setSteps(generatedSteps);

      let expressionTex: string | undefined;
      try {
        expressionTex = limitTex(safeToTex(parse(limitExpr)), 'x', limitPoint);
      } catch {
        // fallback
      }

      dispatch({
        type: 'ADD_HISTORY',
        entry: {
          id: crypto.randomUUID(),
          tab: 'calculus',
          expression: `lim(x->${limitPoint}) [${limitExpr}]`,
          result: resultStr,
          timestamp: Date.now(),
          expressionTex,
          resultTex: resultStr,
        },
      });
    } catch (e) {
      setError((e as Error).message);
      setSteps([]);
      dispatch({ type: 'SET_CALCULUS', updates: { limitResult: '' } });
    }
  };

  let resultTex: string | undefined;
  if (state.calculus.limitResult) {
    try {
      const exprTex = safeToTex(parse(state.calculus.limitExpr));
      resultTex = `${limitTex(exprTex, 'x', state.calculus.limitPoint)} = ${state.calculus.limitResult}`;
    } catch {
      // fallback
    }
  }

  return (
    <div
      role="group"
      aria-labelledby="limit-heading"
      className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] border-l-3 border-l-[#f59e0b] bg-[var(--color-surface)] p-4"
    >
      <h3 id="limit-heading" className="font-semibold text-[var(--color-text)] text-sm">
        Limit
      </h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={state.calculus.limitExpr}
          onChange={(e) => dispatch({ type: 'SET_CALCULUS', updates: { limitExpr: e.target.value } })}
          placeholder="e.g. sin(x)/x"
          aria-label="Limit expression"
          className="min-w-0 w-1/2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
        />
        <input
          type="text"
          value={state.calculus.limitPoint}
          onChange={(e) => dispatch({ type: 'SET_CALCULUS', updates: { limitPoint: e.target.value } })}
          placeholder="x ->"
          aria-label="Limit point"
          className="min-w-0 w-1/2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
        />
      </div>
      <button
        type="button"
        onClick={handleCompute}
        className="self-end rounded-lg bg-[#f59e0b] px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-[#d97706]"
      >
        Compute
      </button>
      {error && (
        <p role="alert" className="text-[var(--color-error)] text-xs">
          {error}
        </p>
      )}
      {state.calculus.limitResult && (
        <div aria-live="polite" role="status" className="rounded-lg bg-[var(--color-surface-alt)] px-3 py-2">
          <span className="text-[var(--color-text-secondary)] text-xs">Result: </span>
          {resultTex ? (
            <KaTeXRenderer
              tex={resultTex}
              ariaLabel={`Limit equals ${state.calculus.limitResult}`}
              className="text-[var(--color-text)] text-sm"
            />
          ) : (
            <span className="font-mono text-[var(--color-text)] text-sm">{state.calculus.limitResult}</span>
          )}
        </div>
      )}
      {steps.length > 0 && (
        <button
          type="button"
          onClick={() => setShowSteps((v) => !v)}
          aria-expanded={showSteps}
          className="self-end rounded px-3 py-1 font-medium text-[#f59e0b] text-xs transition-colors hover:bg-[var(--color-surface-alt)]"
        >
          {showSteps ? 'Hide Steps' : 'Show Steps'}
        </button>
      )}
      {showSteps && steps.length > 0 && <StepViewer steps={steps} onClose={() => setShowSteps(false)} />}
    </div>
  );
}
