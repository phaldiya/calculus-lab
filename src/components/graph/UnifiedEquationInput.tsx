import { useState } from 'react';

import { useAppContext } from '../../context/AppContext';
import { nextColor } from '../../lib/colorPalette';
import { classifyExpression } from '../../lib/expressionClassifier';
import {
  validateExpression,
  validateImplicitExpression,
  validateInequalityExpression,
} from '../../lib/expressionParser';
import type { UnifiedEquation } from '../../types';

function validateForType(result: ReturnType<typeof classifyExpression>): { valid: boolean; error?: string } {
  const expr = result.components[0];
  switch (result.type) {
    case 'inequality-2d':
      return validateInequalityExpression(expr);
    case 'implicit-2d':
      return validateImplicitExpression(expr);
    case 'parametric-2d':
    case 'parametric-3d':
      for (const component of result.components) {
        const v = validateExpression(component);
        if (!v.valid) return v;
      }
      return { valid: true };
    default:
      return validateExpression(expr);
  }
}

export default function UnifiedEquationInput() {
  const { state, dispatch } = useAppContext();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const classification = classifyExpression(input);
    const validation = validateForType(classification);
    if (!validation.valid) {
      setError(validation.error || 'Invalid expression');
      return;
    }

    const defaultParamRange =
      classification.type === 'polar' ||
      classification.type === 'parametric-2d' ||
      classification.type === 'parametric-3d'
        ? { min: 0, max: 2 * Math.PI, numPoints: 500 }
        : undefined;

    const equation: UnifiedEquation = {
      id: crypto.randomUUID(),
      rawInput: input.trim(),
      type: classification.type,
      components: classification.components,
      color: nextColor(),
      visible: true,
      inequalityOp: classification.inequalityOp,
      paramRange: defaultParamRange,
    };

    dispatch({ type: 'GRAPH_ADD_EQUATION', equation });

    // Auto-create sliders for detected parameters
    const existingSliderNames = new Set(state.graph.sliders.map((s) => s.name));
    for (const param of classification.detectedParams) {
      if (!existingSliderNames.has(param)) {
        dispatch({
          type: 'GRAPH_ADD_SLIDER',
          slider: {
            id: crypto.randomUUID(),
            name: param,
            min: -5,
            max: 5,
            step: 0.1,
            value: 1,
          },
        });
      }
    }

    setInput('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError('');
          }}
          placeholder="sin(x), x^2+y^2=25, cos(t);sin(t)"
          aria-label="Expression"
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          Plot
        </button>
      </div>
      {error && (
        <p role="alert" className="text-[var(--color-error)] text-xs">
          {error}
        </p>
      )}
    </form>
  );
}
