interface Props {
  coordinates: { x: number; y: number } | null;
}

export default function CoordinateDisplay({ coordinates }: Props) {
  if (!coordinates) return null;

  return (
    <div className="absolute top-2 right-2 z-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 font-mono text-sm shadow-sm">
      <span className="text-[var(--color-text-secondary)]">x: </span>
      <span className="text-[var(--color-text)]">{coordinates.x.toFixed(4)}</span>
      <span className="ml-3 text-[var(--color-text-secondary)]">y: </span>
      <span className="text-[var(--color-text)]">{coordinates.y.toFixed(4)}</span>
    </div>
  );
}
