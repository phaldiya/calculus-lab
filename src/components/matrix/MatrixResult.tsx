import { matrixToTex } from '../../lib/texHelpers';
import KaTeXRenderer from '../shared/KaTeXRenderer';

interface Props {
  result: number[][] | number | string | null;
  error: string | null;
}

export default function MatrixResult({ result, error }: Props) {
  if (error) {
    return (
      <div role="alert" className="rounded-lg border border-[var(--color-error)] bg-red-50 p-3 dark:bg-red-950">
        <p className="text-[var(--color-error)] text-sm">{error}</p>
      </div>
    );
  }

  if (result === null) return null;

  if (typeof result === 'number') {
    return (
      <output aria-live="polite" className="rounded-lg bg-[var(--color-surface-alt)] p-3">
        <span className="text-[var(--color-text-secondary)] text-xs">Result: </span>
        <span className="font-mono font-semibold text-[var(--color-text)] text-lg">{result.toFixed(4)}</span>
      </output>
    );
  }

  if (typeof result === 'string') {
    return (
      <output aria-live="polite" className="rounded-lg bg-[var(--color-surface-alt)] p-3">
        <span className="font-mono text-[var(--color-text)] text-sm">{result}</span>
      </output>
    );
  }

  const tex = matrixToTex(result);

  return (
    <output aria-live="polite" className="rounded-lg bg-[var(--color-surface-alt)] p-3">
      <span className="mb-2 block text-[var(--color-text-secondary)] text-xs">Result:</span>
      <KaTeXRenderer
        tex={tex}
        displayMode
        ariaLabel={`Result matrix: ${result.map((row) => row.join(', ')).join('; ')}`}
        className="text-[var(--color-text)]"
      />
    </output>
  );
}
