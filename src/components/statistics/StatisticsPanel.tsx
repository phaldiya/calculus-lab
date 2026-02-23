import { useEffect } from 'react';

import { useAppContext } from '../../context/AppContext';
import { computeStats } from '../../lib/statisticsEngine';
import DataInput from './DataInput';
import RegressionPanel from './RegressionPanel';
import StatisticsPlot from './StatisticsPlot';
import StatsResults from './StatsResults';

export default function StatisticsPanel() {
  const { state, dispatch } = useAppContext();

  // Auto-compute stats when data changes
  useEffect(() => {
    if (state.statistics.data.length > 0) {
      try {
        const results = computeStats(state.statistics.data);
        dispatch({ type: 'SET_STATISTICS', updates: { results } });
      } catch {
        dispatch({ type: 'SET_STATISTICS', updates: { results: null } });
      }
    } else {
      dispatch({ type: 'SET_STATISTICS', updates: { results: null } });
    }
  }, [state.statistics.data, dispatch]);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <section
        aria-label="Statistics inputs"
        className="flex max-h-[40vh] w-full flex-col gap-4 overflow-y-auto border-[var(--color-border)] border-b p-4 md:max-h-none md:w-80 md:border-r md:border-b-0"
      >
        {(state.statistics.data.length > 0 || state.statistics.xyData.length > 0) && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'CLEAR_STATISTICS' })}
            className="self-end rounded px-2 py-0.5 text-[var(--color-text-secondary)] text-xs transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-error)]"
          >
            Clear All
          </button>
        )}
        <DataInput />
        <StatsResults results={state.statistics.results} />
        <div className="border-[var(--color-border)] border-t pt-3">
          <RegressionPanel />
        </div>
      </section>
      <div role="img" aria-label="Statistics chart" className="min-h-[300px] flex-1">
        <StatisticsPlot />
      </div>
    </div>
  );
}
