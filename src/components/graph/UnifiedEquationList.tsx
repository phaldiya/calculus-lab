import { useAppContext } from '../../context/AppContext';
import { expressionTypeBadgeClass, expressionTypeLabel } from '../../lib/expressionClassifier';
import { CloseIcon } from '../shared/Icons';

function formatDisplayLabel(eq: { type: string; rawInput: string; components: string[] }): string {
  if (eq.type === 'parametric-2d') return `(${eq.components[0]}, ${eq.components[1]})`;
  if (eq.type === 'parametric-3d') return `(${eq.components.join(', ')})`;
  if (eq.type === 'polar') return `r = ${eq.components[0]}`;
  return eq.rawInput;
}

export default function UnifiedEquationList() {
  const { state, dispatch } = useAppContext();
  const equations = state.graph.equations;

  if (equations.length === 0) {
    return (
      <p className="text-[var(--color-text-secondary)] text-sm italic">
        No equations yet. Enter an expression above to plot.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {equations.map((eq) => {
        const label = formatDisplayLabel(eq);
        return (
          <div key={eq.id} className="flex items-center gap-2 rounded-lg bg-[var(--color-surface-alt)] px-3 py-2">
            <button
              type="button"
              role="switch"
              aria-checked={eq.visible}
              aria-label={`${eq.visible ? 'Hide' : 'Show'} ${label}`}
              onClick={() => dispatch({ type: 'GRAPH_TOGGLE_EQUATION', id: eq.id })}
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
              {label}
            </span>
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 font-medium text-[10px] ${expressionTypeBadgeClass(eq.type)}`}
            >
              {expressionTypeLabel(eq.type)}
            </span>
            {eq.inequalityOp && (
              <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 font-medium text-[10px] text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                {eq.inequalityOp}
              </span>
            )}
            <button
              type="button"
              aria-label={`Remove ${label}`}
              onClick={() => dispatch({ type: 'GRAPH_REMOVE_EQUATION', id: eq.id })}
              className="text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-error)]"
              title="Remove"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
