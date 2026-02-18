import { useAppContext } from '../../context/AppContext';
import { CloseIcon } from '../shared/Icons';

export default function EquationList() {
  const { state, dispatch } = useAppContext();

  if (state.equations.length === 0) {
    return (
      <p className="text-[var(--color-text-secondary)] text-sm italic">
        No equations yet. Enter an expression above to plot.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {state.equations.map((eq) => (
        <div key={eq.id} className="flex items-center gap-2 rounded-lg bg-[var(--color-surface-alt)] px-3 py-2">
          <button
            type="button"
            role="switch"
            aria-checked={eq.visible}
            aria-label={`${eq.visible ? 'Hide' : 'Show'} ${eq.expression}`}
            onClick={() => dispatch({ type: 'TOGGLE_EQUATION', id: eq.id })}
            className="h-4 w-4 flex-shrink-0 rounded-sm border-2"
            style={{
              borderColor: eq.color,
              backgroundColor: eq.visible ? eq.color : 'transparent',
            }}
            title={eq.visible ? 'Hide' : 'Show'}
          />
          <span
            className={`flex-1 font-mono text-sm ${
              eq.visible ? 'text-[var(--color-text)]' : 'text-[var(--color-text-secondary)] line-through'
            }`}
          >
            {eq.expression}
          </span>
          {eq.mode === 'implicit' && (
            <span className="shrink-0 rounded bg-indigo-100 px-1.5 py-0.5 font-medium text-[10px] text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
              implicit
            </span>
          )}
          <button
            type="button"
            aria-label={`Remove ${eq.expression}`}
            onClick={() => dispatch({ type: 'REMOVE_EQUATION', id: eq.id })}
            className="text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-error)]"
            title="Remove"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
