import { useCallback, useRef } from 'react';

import { useAppContext } from '../../context/AppContext';

export default function SliderBar() {
  const { state, dispatch } = useAppContext();
  const rafRef = useRef<number>(0);

  const handleChange = useCallback(
    (id: string, value: number) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        dispatch({ type: 'GRAPH_UPDATE_SLIDER', id, value });
      });
    },
    [dispatch],
  );

  if (state.graph.sliders.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 border-[var(--color-border)] border-t bg-[var(--color-surface)] px-4 py-3">
      {state.graph.sliders.map((slider) => (
        <div key={slider.id} className="flex items-center gap-2">
          <label className="font-mono text-[var(--color-text)] text-xs" htmlFor={`slider-${slider.id}`}>
            {slider.name}
          </label>
          <input
            id={`slider-${slider.id}`}
            type="range"
            min={slider.min}
            max={slider.max}
            step={slider.step}
            value={slider.value}
            onChange={(e) => handleChange(slider.id, Number(e.target.value))}
            aria-label={`${slider.name} slider`}
            className="w-32 accent-[var(--color-primary)]"
          />
          <span className="w-10 text-right font-mono text-[var(--color-text-secondary)] text-xs">
            {slider.value.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}
