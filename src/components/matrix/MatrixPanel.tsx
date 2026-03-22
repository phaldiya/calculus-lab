import { useState } from 'react';

import { useAppContext } from '../../context/AppContext';
import { formatMatrixResult, performMatrixOperation } from '../../lib/matrixEngine';
import { generateMatrixSteps } from '../../lib/matrixStepEngine';
import type { MatrixOperation } from '../../types';
import type { StepItem } from '../shared/StepViewer';
import StepViewer from '../shared/StepViewer';
import MatrixInput from './MatrixInput';
import MatrixOperations from './MatrixOperations';
import MatrixResult from './MatrixResult';

export default function MatrixPanel() {
  const { state, dispatch } = useAppContext();
  const { matrixA, matrixB, operation, result, error } = state.matrix;
  const [steps, setSteps] = useState<StepItem[]>([]);
  const [showSteps, setShowSteps] = useState(false);

  const needsBothMatrices = ['add', 'subtract', 'multiply'].includes(operation);

  const handleCompute = () => {
    try {
      const res = performMatrixOperation(operation, matrixA, matrixB);
      dispatch({ type: 'SET_MATRIX', updates: { result: res as number[][] | number, error: null } });

      const generatedSteps = generateMatrixSteps(operation, matrixA, matrixB, res);
      setSteps(generatedSteps);

      dispatch({
        type: 'ADD_HISTORY',
        entry: {
          id: crypto.randomUUID(),
          tab: 'matrix',
          expression: `${operation}(A${needsBothMatrices ? ', B' : ''})`,
          result: formatMatrixResult(res),
          timestamp: Date.now(),
        },
      });
    } catch (e) {
      setSteps([]);
      dispatch({
        type: 'SET_MATRIX',
        updates: { result: null, error: (e as Error).message },
      });
    }
  };

  return (
    <section aria-label="Matrix calculator" className="flex h-full flex-col overflow-y-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-[var(--color-text)] text-sm">Matrix Calculator</h2>
        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'CLEAR_MATRIX' });
            setSteps([]);
            setShowSteps(false);
          }}
          className="rounded px-2 py-0.5 text-[var(--color-text-secondary)] text-xs transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-error)]"
        >
          Clear All
        </button>
      </div>
      <div className="flex flex-wrap gap-6">
        <MatrixInput
          label="Matrix A"
          matrix={matrixA}
          onChange={(m) => dispatch({ type: 'SET_MATRIX', updates: { matrixA: m } })}
        />
        {needsBothMatrices && (
          <MatrixInput
            label="Matrix B"
            matrix={matrixB}
            onChange={(m) => dispatch({ type: 'SET_MATRIX', updates: { matrixB: m } })}
          />
        )}
      </div>
      <div className="mt-4 max-w-xs">
        <MatrixOperations
          operation={operation}
          onChange={(op: MatrixOperation) =>
            dispatch({ type: 'SET_MATRIX', updates: { operation: op, result: null, error: null } })
          }
          onCompute={handleCompute}
        />
      </div>
      <div className="mt-4">
        <MatrixResult result={result} error={error} />
      </div>
      {steps.length > 0 && (
        <button
          type="button"
          onClick={() => setShowSteps((v) => !v)}
          aria-expanded={showSteps}
          className="mt-2 self-start rounded px-3 py-1 font-medium text-[var(--color-primary)] text-xs transition-colors hover:bg-[var(--color-surface-alt)]"
        >
          {showSteps ? 'Hide Steps' : 'Show Steps'}
        </button>
      )}
      {showSteps && steps.length > 0 && (
        <div className="mt-2">
          <StepViewer steps={steps} onClose={() => setShowSteps(false)} />
        </div>
      )}
    </section>
  );
}
