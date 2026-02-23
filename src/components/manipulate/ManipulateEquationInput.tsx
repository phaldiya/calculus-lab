import { useState } from 'react';

import { useAppContext } from '../../context/AppContext';
import { nextColor } from '../../lib/colorPalette';
import { detectEquationMode, validateExpression, validateImplicitExpression } from '../../lib/expressionParser';
import { extractParameters } from '../../lib/parameterDetector';
import type { ManipulatePlotType } from '../../types';

export default function ManipulateEquationInput() {
  const { state, dispatch } = useAppContext();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const trimmed = input.trim();

    // Determine plot type
    let plotType: ManipulatePlotType = 'standard-2d';
    const mode = detectEquationMode(trimmed);
    if (mode === 'implicit') {
      plotType = 'implicit';
    }
    // Check for z variable to detect 3D surface
    if (/\bz\b/.test(trimmed) || (/\by\b/.test(trimmed) && /\bx\b/.test(trimmed) && mode !== 'implicit')) {
      // If expression uses both x and y without =, it could be z = f(x,y) style
      // We keep it as standard-2d by default unless user explicitly wants 3d
    }

    const validation = mode === 'implicit' ? validateImplicitExpression(trimmed) : validateExpression(trimmed);
    if (!validation.valid) {
      setError(validation.error || 'Invalid expression');
      return;
    }

    // Auto-detect parameters and suggest sliders
    const existingSliderNames = new Set(state.manipulate.sliders.map((s) => s.name));
    const params = extractParameters(trimmed).filter((p) => !existingSliderNames.has(p));

    dispatch({
      type: 'ADD_MANIPULATE_EQUATION',
      equation: {
        id: crypto.randomUUID(),
        expression: trimmed,
        color: nextColor(),
        visible: true,
        plotType,
      },
    });

    // Auto-create sliders for detected parameters
    for (const param of params) {
      dispatch({
        type: 'ADD_SLIDER',
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

    setInput('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError('');
          }}
          placeholder="e.g. a * sin(b * x)"
          aria-label="Manipulate expression"
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
