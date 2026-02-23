import type { MatrixOperation } from '../../types';

interface Props {
  operation: MatrixOperation;
  onChange: (op: MatrixOperation) => void;
  onCompute: () => void;
}

const operations: { value: MatrixOperation; label: string }[] = [
  { value: 'add', label: 'A + B' },
  { value: 'subtract', label: 'A - B' },
  { value: 'multiply', label: 'A × B' },
  { value: 'determinant', label: 'det(A)' },
  { value: 'inverse', label: 'A⁻¹' },
  { value: 'transpose', label: 'Aᵀ' },
];

export default function MatrixOperations({ operation, onChange, onCompute }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-[var(--color-text)] text-sm">Operation</span>
      <fieldset aria-label="Matrix operation" className="m-0 grid grid-cols-3 gap-1 border-0 p-0">
        {operations.map((op) => (
          <button
            type="button"
            key={op.value}
            aria-pressed={operation === op.value}
            onClick={() => onChange(op.value)}
            className={`rounded px-2 py-1.5 font-medium text-xs transition-colors ${
              operation === op.value
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface-alt)] text-[var(--color-text)] hover:bg-[var(--color-border)]'
            }`}
          >
            {op.label}
          </button>
        ))}
      </fieldset>
      <button
        type="button"
        onClick={onCompute}
        className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-[var(--color-primary-hover)]"
      >
        Compute
      </button>
    </div>
  );
}
