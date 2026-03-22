import { useState } from 'react';

import { useAppContext } from '../../context/AppContext';
import { nextColor } from '../../lib/colorPalette';
import type { PointData } from '../../types';
import { CloseIcon } from '../shared/Icons';

export default function PointPlotInput() {
  const { state, dispatch } = useAppContext();
  const [points, setPoints] = useState<{ x: string; y: string }[]>([{ x: '', y: '' }]);
  const [label, setLabel] = useState('');
  const [mode, setMode] = useState<PointData['mode']>('markers');
  const [showForm, setShowForm] = useState(false);

  const addRow = () => setPoints([...points, { x: '', y: '' }]);

  const removeRow = (index: number) => {
    if (points.length <= 1) return;
    setPoints(points.filter((_, i) => i !== index));
  };

  const updatePoint = (index: number, field: 'x' | 'y', value: string) => {
    const updated = [...points];
    updated[index] = { ...updated[index], [field]: value };
    setPoints(updated);
  };

  const handleSubmit = () => {
    const validPoints = points
      .filter((p) => p.x.trim() !== '' && p.y.trim() !== '')
      .map((p) => ({ x: parseFloat(p.x), y: parseFloat(p.y) }))
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));

    if (validPoints.length === 0) return;

    dispatch({
      type: 'GRAPH_ADD_POINT_DATA',
      pointData: {
        id: crypto.randomUUID(),
        points: validPoints,
        color: nextColor(),
        visible: true,
        label: label || `Points ${state.graph.pointDataSets.length + 1}`,
        mode,
      },
    });

    setPoints([{ x: '', y: '' }]);
    setLabel('');
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        aria-expanded={showForm}
        onClick={() => setShowForm(!showForm)}
        className="text-left font-medium text-[var(--color-primary)] text-sm hover:text-[var(--color-primary-hover)]"
      >
        {showForm ? '- Hide point plotter' : '+ Plot custom points'}
      </button>

      {showForm && (
        <div className="flex flex-col gap-2 rounded-lg bg-[var(--color-surface-alt)] p-3">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (optional)"
            aria-label="Dataset label"
            className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-[var(--color-text)] text-sm"
          />

          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as PointData['mode'])}
            aria-label="Plot mode"
            className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-[var(--color-text)] text-sm"
          >
            <option value="markers">Scatter</option>
            <option value="lines">Line</option>
            <option value="lines+markers">Both</option>
          </select>

          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-1 font-medium text-[var(--color-text-secondary)] text-xs">
              <span className="pl-2">X</span>
              <span className="pl-2">Y</span>
              <span className="w-6" />
            </div>
            {points.map((p, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-1">
                <input
                  type="number"
                  value={p.x}
                  onChange={(e) => updatePoint(i, 'x', e.target.value)}
                  className="min-w-0 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-[var(--color-text)] text-sm"
                  placeholder="x"
                />
                <input
                  type="number"
                  value={p.y}
                  onChange={(e) => updatePoint(i, 'y', e.target.value)}
                  className="min-w-0 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-[var(--color-text)] text-sm"
                  placeholder="y"
                />
                <button
                  type="button"
                  aria-label="Remove row"
                  onClick={() => removeRow(i)}
                  className="flex h-6 w-6 items-center justify-center self-center text-[var(--color-text-secondary)] hover:text-[var(--color-error)]"
                  title="Remove row"
                >
                  <CloseIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={addRow}
              className="flex-1 rounded border border-[var(--color-primary)] px-2 py-1 font-medium text-[var(--color-primary)] text-xs transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950"
            >
              + Add Row
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 rounded bg-[var(--color-primary)] px-2 py-1 font-medium text-white text-xs transition-colors hover:bg-[var(--color-primary-hover)]"
            >
              Plot Points
            </button>
          </div>
        </div>
      )}

      {state.graph.pointDataSets.length > 0 && (
        <div className="flex flex-col gap-1">
          {state.graph.pointDataSets.map((pd) => (
            <div key={pd.id} className="flex items-center gap-2 rounded-lg bg-[var(--color-surface-alt)] px-3 py-1.5">
              <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: pd.color }} />
              <span className="flex-1 text-[var(--color-text)] text-sm">
                {pd.label} ({pd.points.length} pts)
              </span>
              <button
                type="button"
                aria-label={`Remove ${pd.label}`}
                onClick={() => dispatch({ type: 'GRAPH_REMOVE_POINT_DATA', id: pd.id })}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-error)]"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
