import { appReducer, initialGraph } from '../../src/context/AppContext';
import type { AppAction, AppState } from '../../src/types';

export function createTestState(overrides: Partial<AppState> = {}): AppState {
  return {
    activeTab: 'scientific',
    graph: initialGraph,
    calculus: {
      derivativeExpr: '',
      derivativeResult: '',
      integralExpr: '',
      integralLower: '',
      integralUpper: '',
      integralResult: '',
      limitExpr: '',
      limitPoint: '',
      limitResult: '',
    },
    matrix: {
      matrixA: [
        [0, 0],
        [0, 0],
      ],
      matrixB: [
        [0, 0],
        [0, 0],
      ],
      operation: 'add',
      result: null,
      error: null,
    },
    statistics: {
      data: [],
      dataInput: '',
      results: null,
      regressionType: 'linear',
      regressionDegree: 2,
      regressionResult: null,
      xyData: [],
    },
    history: [],
    variables: [],
    darkMode: false,
    ...overrides,
  };
}

export function applyActions(state: AppState, actions: AppAction[]): AppState {
  return actions.reduce((s, action) => appReducer(s, action), state);
}
