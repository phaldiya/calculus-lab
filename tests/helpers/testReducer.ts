import { appReducer } from '../../src/context/AppContext';
import type { AppAction, AppState } from '../../src/types';

export function createTestState(overrides: Partial<AppState> = {}): AppState {
  return {
    activeTab: 'scientific',
    equations: [],
    pointDataSets: [],
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
    threeDGraphing: {
      equations: [],
      xRange: [-5, 5],
      yRange: [-5, 5],
      gridResolution: 50,
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
