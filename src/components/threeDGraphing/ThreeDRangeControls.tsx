import { useAppContext } from '../../context/AppContext';

export default function ThreeDRangeControls() {
  const { state, dispatch } = useAppContext();
  const { xRange, yRange, gridResolution } = state.threeDGraphing;

  const updateRange = (axis: 'xRange' | 'yRange', index: 0 | 1, value: string) => {
    const num = Number(value);
    if (Number.isNaN(num)) return;
    const range = axis === 'xRange' ? [...xRange] : [...yRange];
    range[index] = num;
    dispatch({ type: 'SET_3D_GRAPHING', updates: { [axis]: range as [number, number] } });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <span className="font-medium text-[var(--color-text-secondary)] text-xs">X Range</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={xRange[0]}
            onChange={(e) => updateRange('xRange', 0, e.target.value)}
            aria-label="X minimum"
            className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2 py-1 text-[var(--color-text)] text-sm"
          />
          <span className="text-[var(--color-text-secondary)] text-xs">to</span>
          <input
            type="number"
            value={xRange[1]}
            onChange={(e) => updateRange('xRange', 1, e.target.value)}
            aria-label="X maximum"
            className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2 py-1 text-[var(--color-text)] text-sm"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="font-medium text-[var(--color-text-secondary)] text-xs">Y Range</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={yRange[0]}
            onChange={(e) => updateRange('yRange', 0, e.target.value)}
            aria-label="Y minimum"
            className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2 py-1 text-[var(--color-text)] text-sm"
          />
          <span className="text-[var(--color-text-secondary)] text-xs">to</span>
          <input
            type="number"
            value={yRange[1]}
            onChange={(e) => updateRange('yRange', 1, e.target.value)}
            aria-label="Y maximum"
            className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2 py-1 text-[var(--color-text)] text-sm"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="font-medium text-[var(--color-text-secondary)] text-xs">
          Grid Resolution: {gridResolution}
        </span>
        <input
          type="range"
          min={10}
          max={100}
          value={gridResolution}
          onChange={(e) => dispatch({ type: 'SET_3D_GRAPHING', updates: { gridResolution: Number(e.target.value) } })}
          aria-label="Grid resolution"
          className="w-full accent-[var(--color-primary)]"
        />
      </div>
    </div>
  );
}
