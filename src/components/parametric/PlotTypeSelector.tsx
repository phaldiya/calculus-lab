import { useAppContext } from '../../context/AppContext';
import type { ParametricPlotType } from '../../types';

const options: { value: ParametricPlotType; label: string }[] = [
  { value: 'parametric-2d', label: '2D Param' },
  { value: 'parametric-3d', label: '3D Param' },
  { value: 'polar', label: 'Polar' },
];

export default function PlotTypeSelector() {
  const { state, dispatch } = useAppContext();
  const active = state.parametric.activePlotType;

  return (
    <div className="flex gap-1 rounded-lg bg-[var(--color-surface-alt)] p-1" role="radiogroup" aria-label="Plot type">
      {options.map((opt) => (
        // biome-ignore lint/a11y/useSemanticElements: custom radio group with proper ARIA
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={active === opt.value}
          onClick={() => dispatch({ type: 'SET_PARAMETRIC', updates: { activePlotType: opt.value } })}
          className={`flex-1 rounded-md px-2 py-1.5 font-medium text-xs transition-colors ${
            active === opt.value
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
