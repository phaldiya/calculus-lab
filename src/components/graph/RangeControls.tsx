import { useAppContext } from '../../context/AppContext';

export default function RangeControls() {
  const { state, dispatch } = useAppContext();
  const { xRange, yRange, gridResolution } = state.graph;

  const update = (updates: { xRange?: [number, number]; yRange?: [number, number]; gridResolution?: number }) => {
    dispatch({ type: 'GRAPH_SET_CONFIG', updates });
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-medium text-[var(--color-text)] text-xs">Range & Grid</h3>
      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor="graph-xmin" className="mb-0.5 block text-[10px] text-[var(--color-text-secondary)]">
            X min
          </label>
          <input
            id="graph-xmin"
            type="number"
            value={xRange[0]}
            onChange={(e) => update({ xRange: [Number(e.target.value), xRange[1]] })}
            aria-label="X axis minimum"
            className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2 py-1 text-[var(--color-text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="graph-xmax" className="mb-0.5 block text-[10px] text-[var(--color-text-secondary)]">
            X max
          </label>
          <input
            id="graph-xmax"
            type="number"
            value={xRange[1]}
            onChange={(e) => update({ xRange: [xRange[0], Number(e.target.value)] })}
            aria-label="X axis maximum"
            className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2 py-1 text-[var(--color-text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor="graph-ymin" className="mb-0.5 block text-[10px] text-[var(--color-text-secondary)]">
            Y min
          </label>
          <input
            id="graph-ymin"
            type="number"
            value={yRange[0]}
            onChange={(e) => update({ yRange: [Number(e.target.value), yRange[1]] })}
            aria-label="Y axis minimum"
            className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2 py-1 text-[var(--color-text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="graph-ymax" className="mb-0.5 block text-[10px] text-[var(--color-text-secondary)]">
            Y max
          </label>
          <input
            id="graph-ymax"
            type="number"
            value={yRange[1]}
            onChange={(e) => update({ yRange: [yRange[0], Number(e.target.value)] })}
            aria-label="Y axis maximum"
            className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2 py-1 text-[var(--color-text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>
      </div>
      <div>
        <label htmlFor="graph-grid-res" className="mb-0.5 block text-[10px] text-[var(--color-text-secondary)]">
          Grid resolution
        </label>
        <input
          id="graph-grid-res"
          type="number"
          value={gridResolution}
          min={10}
          max={200}
          onChange={(e) => update({ gridResolution: Math.max(10, Math.min(200, Number(e.target.value))) })}
          aria-label="Grid resolution"
          className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2 py-1 text-[var(--color-text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
        />
      </div>
    </div>
  );
}
