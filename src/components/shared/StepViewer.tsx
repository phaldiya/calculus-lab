import { useCallback, useEffect, useState } from 'react';

import KaTeXRenderer from './KaTeXRenderer';

export interface StepItem {
  label: string;
  contentTex: string;
  explanation?: string;
}

interface Props {
  steps: StepItem[];
  onClose: () => void;
}

export default function StepViewer({ steps, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const goPrev = useCallback(() => setCurrentIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(() => setCurrentIndex((i) => Math.min(steps.length - 1, i + 1)), [steps.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goPrev, goNext]);

  if (steps.length === 0) return null;

  const step = steps[currentIndex];

  return (
    <section
      aria-label="Step-by-step solution"
      className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-[var(--color-text)] text-sm">
          Step {currentIndex + 1} of {steps.length}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="rounded px-2 py-1 text-[var(--color-text-secondary)] text-xs hover:bg-[var(--color-surface-alt)]"
          >
            {showAll ? 'Step view' : 'Show all'}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close step viewer"
            className="rounded px-2 py-1 text-[var(--color-text-secondary)] text-xs hover:bg-[var(--color-surface-alt)]"
          >
            Close
          </button>
        </div>
      </div>

      {showAll ? (
        <div className="flex max-h-64 flex-col gap-3 overflow-y-auto">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col gap-1 border-[var(--color-border)] border-b pb-2 last:border-0">
              <span className="font-medium text-[var(--color-primary)] text-xs">
                Step {i + 1}: {s.label}
              </span>
              <KaTeXRenderer tex={s.contentTex} ariaLabel={`Step ${i + 1}: ${s.label}`} className="text-sm" />
              {s.explanation && <span className="text-[var(--color-text-secondary)] text-xs">{s.explanation}</span>}
            </div>
          ))}
        </div>
      ) : (
        <div aria-live="polite" className="flex flex-col gap-1 transition-opacity duration-200">
          <span className="font-medium text-[var(--color-primary)] text-xs">{step.label}</span>
          <KaTeXRenderer
            tex={step.contentTex}
            ariaLabel={`Step ${currentIndex + 1}: ${step.label}`}
            className="text-sm"
          />
          {step.explanation && <span className="text-[var(--color-text-secondary)] text-xs">{step.explanation}</span>}
        </div>
      )}

      {!showAll && (
        <div className="flex justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentIndex === 0}
            aria-label="Previous step"
            className="rounded bg-[var(--color-surface-alt)] px-3 py-1 text-sm transition-colors hover:bg-[var(--color-border)] disabled:opacity-40"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={currentIndex === steps.length - 1}
            aria-label="Next step"
            className="rounded bg-[var(--color-surface-alt)] px-3 py-1 text-sm transition-colors hover:bg-[var(--color-border)] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
