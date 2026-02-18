import { parse } from 'mathjs';
import { useState } from 'react';

import { useAppContext } from '../../context/AppContext';
import { computeDefiniteIntegral } from '../../lib/calculusEngine';
import { generateIntegralSteps } from '../../lib/calculusStepEngine';
import { integralTex, safeToTex } from '../../lib/texHelpers';
import KaTeXRenderer from '../shared/KaTeXRenderer';
import type { StepItem } from '../shared/StepViewer';
import StepViewer from '../shared/StepViewer';

export default function IntegralInput() {
  const { state, dispatch } = useAppContext();
  const [error, setError] = useState('');
  const [steps, setSteps] = useState<StepItem[]>([]);
  const [showSteps, setShowSteps] = useState(false);

  const handleCompute = () => {
    const { integralExpr, integralLower, integralUpper } = state.calculus;
    if (!integralExpr.trim() || !integralLower.trim() || !integralUpper.trim()) return;

    setError('');
    try {
      const lower = parseFloat(integralLower);
      const upper = parseFloat(integralUpper);
      if (!Number.isFinite(lower) || !Number.isFinite(upper)) {
        setError('Bounds must be valid numbers');
        return;
      }
      const result = computeDefiniteIntegral(integralExpr, lower, upper);
      const resultStr = result.toFixed(6);
      dispatch({ type: 'SET_CALCULUS', updates: { integralResult: resultStr } });

      const generatedSteps = generateIntegralSteps(integralExpr, integralLower, integralUpper, resultStr);
      setSteps(generatedSteps);

      let expressionTex: string | undefined;
      try {
        expressionTex = integralTex(safeToTex(parse(integralExpr)), integralLower, integralUpper);
      } catch {
        // fallback
      }

      dispatch({
        type: 'ADD_HISTORY',
        entry: {
          id: crypto.randomUUID(),
          tab: 'calculus',
          expression: `integral of [${integralExpr}] from ${integralLower} to ${integralUpper}`,
          result: resultStr,
          timestamp: Date.now(),
          expressionTex,
          resultTex: resultStr,
        },
      });
    } catch (e) {
      setError((e as Error).message);
      setSteps([]);
      dispatch({ type: 'SET_CALCULUS', updates: { integralResult: '' } });
    }
  };

  let resultTex: string | undefined;
  if (state.calculus.integralResult) {
    try {
      const exprTex = safeToTex(parse(state.calculus.integralExpr));
      resultTex = `${integralTex(exprTex, state.calculus.integralLower, state.calculus.integralUpper)} \\approx ${state.calculus.integralResult}`;
    } catch {
      // fallback
    }
  }

  return (
    <div
      role="group"
      aria-labelledby="integral-heading"
      className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] border-l-3 border-l-[#10b981] bg-[var(--color-surface)] p-4"
    >
      <h3 id="integral-heading" className="font-semibold text-[var(--color-text)] text-sm">
        Definite Integral
      </h3>
      <input
        type="text"
        value={state.calculus.integralExpr}
        onChange={(e) => dispatch({ type: 'SET_CALCULUS', updates: { integralExpr: e.target.value } })}
        placeholder="e.g. x^2"
        aria-label="Integral expression"
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
      />
      <div className="flex gap-2">
        <input
          type="text"
          value={state.calculus.integralLower}
          onChange={(e) => dispatch({ type: 'SET_CALCULUS', updates: { integralLower: e.target.value } })}
          placeholder="Lower"
          aria-label="Lower bound"
          className="min-w-0 w-1/2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
        />
        <input
          type="text"
          value={state.calculus.integralUpper}
          onChange={(e) => dispatch({ type: 'SET_CALCULUS', updates: { integralUpper: e.target.value } })}
          placeholder="Upper"
          aria-label="Upper bound"
          className="min-w-0 w-1/2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
        />
      </div>
      <button
        type="button"
        onClick={handleCompute}
        className="self-end rounded-lg bg-[#10b981] px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-[#059669]"
      >
        Compute
      </button>
      {error && (
        <p role="alert" className="text-[var(--color-error)] text-xs">
          {error}
        </p>
      )}
      {state.calculus.integralResult && (
        <div aria-live="polite" role="status" className="rounded-lg bg-[var(--color-surface-alt)] px-3 py-2">
          <span className="text-[var(--color-text-secondary)] text-xs">Result: </span>
          {resultTex ? (
            <KaTeXRenderer
              tex={resultTex}
              ariaLabel={`Integral equals ${state.calculus.integralResult}`}
              className="text-[var(--color-text)] text-sm"
            />
          ) : (
            <span className="font-mono text-[var(--color-text)] text-sm">{state.calculus.integralResult}</span>
          )}
        </div>
      )}
      {steps.length > 0 && (
        <button
          type="button"
          onClick={() => setShowSteps((v) => !v)}
          aria-expanded={showSteps}
          className="self-end rounded px-3 py-1 font-medium text-[#10b981] text-xs transition-colors hover:bg-[var(--color-surface-alt)]"
        >
          {showSteps ? 'Hide Steps' : 'Show Steps'}
        </button>
      )}
      {showSteps && steps.length > 0 && <StepViewer steps={steps} onClose={() => setShowSteps(false)} />}
    </div>
  );
}
