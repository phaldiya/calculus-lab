import { useState } from 'react';

import { useAppContext } from '../../context/AppContext';
import { nextColor } from '../../lib/colorPalette';
import { validateExpression } from '../../lib/expressionParser';

export default function ThreeDEquationInput() {
  const { dispatch } = useAppContext();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const validation = validateExpression(input.trim());
    if (!validation.valid) {
      setError(validation.error || 'Invalid expression');
      return;
    }

    dispatch({
      type: 'ADD_3D_EQUATION',
      equation: {
        id: crypto.randomUUID(),
        expression: input.trim(),
        color: nextColor(),
        visible: true,
      },
    });
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
          placeholder="e.g. sin(x) * cos(y)"
          aria-label="3D surface expression"
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
