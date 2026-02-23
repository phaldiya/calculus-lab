import { useState } from 'react';

import { useAppContext } from '../../context/AppContext';
import { CloseIcon } from '../shared/Icons';

export default function SliderPanel() {
  const { state, dispatch } = useAppContext();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    if (!/^[a-zA-Z_]\w*$/.test(trimmed)) {
      setError('Invalid parameter name');
      return;
    }

    if (state.manipulate.sliders.some((s) => s.name === trimmed)) {
      setError('Slider already exists');
      return;
    }

    dispatch({
      type: 'ADD_SLIDER',
      slider: {
        id: crypto.randomUUID(),
        name: trimmed,
        min: -5,
        max: 5,
        step: 0.1,
        value: 1,
      },
    });
    setName('');
    setError('');
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-medium text-[var(--color-text)] text-xs">Parameters</h3>
      <form onSubmit={handleAdd} className="flex gap-1">
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          placeholder="Add param, e.g. a"
          aria-label="Slider parameter name"
          className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2 py-1 text-[var(--color-text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
        />
        <button
          type="submit"
          className="rounded bg-[var(--color-primary)] px-2 py-1 text-white text-xs transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          Add
        </button>
      </form>
      {error && <p className="text-[var(--color-error)] text-xs">{error}</p>}
      {state.manipulate.sliders.map((slider) => (
        <div key={slider.id} className="flex flex-col gap-1 rounded-lg bg-[var(--color-surface-alt)] p-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[var(--color-text)] text-xs">
              {slider.name} = {slider.value.toFixed(1)}
            </span>
            <button
              type="button"
              aria-label={`Remove slider ${slider.name}`}
              onClick={() => dispatch({ type: 'REMOVE_SLIDER', id: slider.id })}
              className="text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-error)]"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={slider.min}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_SLIDER_CONFIG', id: slider.id, updates: { min: Number(e.target.value) } })
              }
              aria-label={`${slider.name} minimum`}
              className="w-12 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-1 py-0.5 text-center text-[var(--color-text)] text-xs"
            />
            <input
              type="number"
              value={slider.max}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_SLIDER_CONFIG', id: slider.id, updates: { max: Number(e.target.value) } })
              }
              aria-label={`${slider.name} maximum`}
              className="w-12 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-1 py-0.5 text-center text-[var(--color-text)] text-xs"
            />
            <input
              type="number"
              value={slider.step}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_SLIDER_CONFIG',
                  id: slider.id,
                  updates: { step: Number(e.target.value) || 0.1 },
                })
              }
              aria-label={`${slider.name} step`}
              className="w-12 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-1 py-0.5 text-center text-[var(--color-text)] text-xs"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
