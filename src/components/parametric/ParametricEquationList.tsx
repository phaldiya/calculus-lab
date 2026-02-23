import { useAppContext } from '../../context/AppContext';
import type { ParametricPlotType } from '../../types';
import { CloseIcon } from '../shared/Icons';

const plotTypeLabels: Record<ParametricPlotType, string> = {
  'parametric-2d': '2D',
  'parametric-3d': '3D',
  polar: 'polar',
};

function formatEquation(eq: { plotType: ParametricPlotType; xExpr: string; yExpr: string; zExpr?: string }): string {
  if (eq.plotType === 'polar') return `r = ${eq.xExpr}`;
  if (eq.plotType === 'parametric-3d') return `(${eq.xExpr}, ${eq.yExpr}, ${eq.zExpr})`;
  return `(${eq.xExpr}, ${eq.yExpr})`;
}

export default function ParametricEquationList() {
  const { state, dispatch } = useAppContext();
  const equations = state.parametric.equations;

  if (equations.length === 0) {
    return (
      <p className="text-[var(--color-text-secondary)] text-sm italic">
        No curves yet. Enter expressions above to plot.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {equations.map((eq) => {
        const label = formatEquation(eq);
        return (
          <div key={eq.id} className="flex items-center gap-2 rounded-lg bg-[var(--color-surface-alt)] px-3 py-2">
            <button
              type="button"
              role="switch"
              aria-checked={eq.visible}
              aria-label={`${eq.visible ? 'Hide' : 'Show'} ${label}`}
              onClick={() => dispatch({ type: 'TOGGLE_PARAMETRIC_EQUATION', id: eq.id })}
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
            <span className="shrink-0 rounded bg-cyan-100 px-1.5 py-0.5 font-medium text-[10px] text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300">
              {plotTypeLabels[eq.plotType]}
            </span>
            <button
              type="button"
              aria-label={`Remove ${label}`}
              onClick={() => dispatch({ type: 'REMOVE_PARAMETRIC_EQUATION', id: eq.id })}
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
