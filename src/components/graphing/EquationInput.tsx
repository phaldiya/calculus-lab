import { useState } from 'react';

import { useAppContext } from '../../context/AppContext';
import { nextColor } from '../../lib/colorPalette';
import {
  detectEquationMode,
  parseInequalityExpression,
  validateExpression,
  validateImplicitExpression,
  validateInequalityExpression,
} from '../../lib/expressionParser';

export default function EquationInput() {
  const { dispatch } = useAppContext();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const trimmed = input.trim();
    const mode = detectEquationMode(trimmed);
    let validation: { valid: boolean; error?: string };
    if (mode === 'inequality') {
      validation = validateInequalityExpression(trimmed);
    } else if (mode === 'implicit') {
      validation = validateImplicitExpression(trimmed);
    } else {
      validation = validateExpression(trimmed);
    }
    if (!validation.valid) {
      setError(validation.error || 'Invalid expression');
      return;
    }

    const inequalityOp = mode === 'inequality' ? parseInequalityExpression(trimmed)?.operator : undefined;

    dispatch({
      type: 'ADD_EQUATION',
      equation: {
        id: crypto.randomUUID(),
        expression: trimmed,
        color: nextColor(),
        visible: true,
        mode,
        inequalityOp,
      },
    });
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
          placeholder="e.g. sin(x), x^2 + y^2 = 25, or y > x^2"
          aria-label="Function expression"
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
