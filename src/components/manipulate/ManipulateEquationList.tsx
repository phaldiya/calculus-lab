import { useAppContext } from '../../context/AppContext';
import { CloseIcon } from '../shared/Icons';

export default function ManipulateEquationList() {
  const { state, dispatch } = useAppContext();
  const equations = state.manipulate.equations;

  if (equations.length === 0) {
    return (
      <p className="text-[var(--color-text-secondary)] text-sm italic">
        No equations yet. Enter an expression with parameters above.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {equations.map((eq) => (
        <div key={eq.id} className="flex items-center gap-2 rounded-lg bg-[var(--color-surface-alt)] px-3 py-2">
          <button
            type="button"
            role="switch"
            aria-checked={eq.visible}
            aria-label={`${eq.visible ? 'Hide' : 'Show'} ${eq.expression}`}
            onClick={() => dispatch({ type: 'TOGGLE_MANIPULATE_EQUATION', id: eq.id })}
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
          <button
            type="button"
            aria-label={`Remove ${eq.expression}`}
            onClick={() => dispatch({ type: 'REMOVE_MANIPULATE_EQUATION', id: eq.id })}
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
