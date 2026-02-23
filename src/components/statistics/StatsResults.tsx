import type { StatsResults as StatsResultsType } from '../../types';

interface Props {
  results: StatsResultsType | null;
}

export default function StatsResults({ results }: Props) {
  if (!results) return null;

  const stats = [
    { label: 'Count', value: results.count },
    { label: 'Mean', value: results.mean.toFixed(4) },
    { label: 'Median', value: results.median.toFixed(4) },
    { label: 'Mode', value: results.mode.length > 0 ? results.mode.join(', ') : 'None' },
    { label: 'Std Dev', value: results.stdDev.toFixed(4) },
    { label: 'Variance', value: results.variance.toFixed(4) },
    { label: 'Min', value: results.min.toFixed(4) },
    { label: 'Max', value: results.max.toFixed(4) },
    { label: 'Range', value: results.range.toFixed(4) },
    { label: 'Sum', value: results.sum.toFixed(4) },
    { label: 'Q1', value: results.q1.toFixed(4) },
    { label: 'Q3', value: results.q3.toFixed(4) },
    { label: 'IQR', value: results.iqr.toFixed(4) },
  ];

  return (
    <output aria-live="polite" className="flex flex-col gap-1">
      <h3 className="font-semibold text-[var(--color-text)] text-sm">Descriptive Statistics</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {stats.map((s) => (
          <div key={s.label} className="flex justify-between text-sm">
            <span className="text-[var(--color-text-secondary)]">{s.label}:</span>
            <span className="font-mono text-[var(--color-text)]">{s.value}</span>
          </div>
        ))}
      </div>
    </output>
  );
}
