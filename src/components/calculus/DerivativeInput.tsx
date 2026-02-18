import { parse } from 'mathjs';
import { useState } from 'react';

import { useAppContext } from '../../context/AppContext';
import { computeDerivative } from '../../lib/calculusEngine';
import { generateDerivativeSteps } from '../../lib/calculusStepEngine';
import { derivativeTex, safeToTex } from '../../lib/texHelpers';
import KaTeXRenderer from '../shared/KaTeXRenderer';
import type { StepItem } from '../shared/StepViewer';
import StepViewer from '../shared/StepViewer';

export default function DerivativeInput() {
  const { state, dispatch } = useAppContext();
  const [error, setError] = useState('');
  const [steps, setSteps] = useState<StepItem[]>([]);
  const [showSteps, setShowSteps] = useState(false);

  const handleCompute = () => {
    if (!state.calculus.derivativeExpr.trim()) return;
    setError('');
    try {
      const result = computeDerivative(state.calculus.derivativeExpr);
      dispatch({ type: 'SET_CALCULUS', updates: { derivativeResult: result } });

      const generatedSteps = generateDerivativeSteps(state.calculus.derivativeExpr);
      setSteps(generatedSteps);

      let expressionTex: string | undefined;
      let resultTex: string | undefined;
      try {
        expressionTex = derivativeTex(safeToTex(parse(state.calculus.derivativeExpr)));
        resultTex = safeToTex(parse(result));
      } catch {
        // fallback
      }

      dispatch({
        type: 'ADD_HISTORY',
        entry: {
          id: crypto.randomUUID(),
          tab: 'calculus',
          expression: `d/dx [${state.calculus.derivativeExpr}]`,
          result,
          timestamp: Date.now(),
          expressionTex,
          resultTex,
        },
      });
    } catch (e) {
      setError((e as Error).message);
      setSteps([]);
      dispatch({ type: 'SET_CALCULUS', updates: { derivativeResult: '' } });
    }
  };

  let resultTex: string | undefined;
  if (state.calculus.derivativeResult) {
    try {
      const exprTex = safeToTex(parse(state.calculus.derivativeExpr));
      const resTex = safeToTex(parse(state.calculus.derivativeResult));
      resultTex = `${derivativeTex(exprTex)} = ${resTex}`;
    } catch {
      // fallback to plain text
    }
  }

  return (
    <div
      role="group"
      aria-labelledby="deriv-heading"
      className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] border-l-3 border-l-[#6366f1] bg-[var(--color-surface)] p-4"
    >
      <h3 id="deriv-heading" className="font-semibold text-[var(--color-text)] text-sm">
        Derivative
      </h3>
      <input
        type="text"
        value={state.calculus.derivativeExpr}
        onChange={(e) => dispatch({ type: 'SET_CALCULUS', updates: { derivativeExpr: e.target.value } })}
        placeholder="e.g. x^3, sin(x)"
        aria-label="Derivative expression"
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
      />
      <button
        type="button"
        onClick={handleCompute}
        className="self-end rounded-lg bg-[#6366f1] px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-[#4f46e5]"
      >
        d/dx
      </button>
      {error && (
        <p role="alert" className="text-[var(--color-error)] text-xs">
          {error}
        </p>
      )}
      {state.calculus.derivativeResult && (
        <div aria-live="polite" role="status" className="rounded-lg bg-[var(--color-surface-alt)] px-3 py-2">
          <span className="text-[var(--color-text-secondary)] text-xs">Result: </span>
          {resultTex ? (
            <KaTeXRenderer
              tex={resultTex}
              ariaLabel={`Derivative equals ${state.calculus.derivativeResult}`}
              className="text-[var(--color-text)] text-sm"
            />
          ) : (
            <span className="font-mono text-[var(--color-text)] text-sm">{state.calculus.derivativeResult}</span>
          )}
        </div>
      )}
      {steps.length > 0 && (
        <button
          type="button"
          onClick={() => setShowSteps((v) => !v)}
          aria-expanded={showSteps}
          className="self-end rounded px-3 py-1 font-medium text-[#6366f1] text-xs transition-colors hover:bg-[var(--color-surface-alt)]"
        >
          {showSteps ? 'Hide Steps' : 'Show Steps'}
        </button>
      )}
      {showSteps && steps.length > 0 && <StepViewer steps={steps} onClose={() => setShowSteps(false)} />}
    </div>
  );
}
